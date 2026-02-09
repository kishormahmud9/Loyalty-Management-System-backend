import Stripe from "stripe";
import prisma from "../../prisma/client.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// CREATE CHECKOUT SESSION (BUSINESS OWNER ONLY)

export const createCheckoutSession = async ({ user, businessId, planId, billingCycle }) => {
  // 1️⃣ Find business owned by user
  const business = await prisma.business.findFirst({
    where: { id: businessId, ownerId: user.id },
  });

  if (!business) {
    throw new Error("Business not found for this owner");
  }

  // 2️⃣ Get plan
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error("Plan not found");
  }

  const priceId =
    billingCycle === "YEARLY"
      ? plan.stripeYearlyPriceId
      : plan.stripeMonthlyPriceId;

  if (!priceId) {
    throw new Error("Stripe price not configured for this plan");
  }

  // 3️⃣ Create Stripe customer if missing
  let stripeCustomerId = business.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: business.name,
      metadata: {
        businessId: business.id,
      },
    });

    stripeCustomerId = customer.id;

    await prisma.business.update({
      where: { id: business.id },
      data: { stripeCustomerId },
    });
  }

  // 4️⃣ Check for existing subscription to determine trial eligibility
  const existingSubscription = await prisma.businessSubscription.findFirst({
    where: { businessId: business.id },
  });

  const trialDays = existingSubscription ? undefined : 14;

  // 5️⃣ Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      ...(trialDays && { trial_period_days: trialDays }),
      metadata: {
        businessId: business.id,
        planId: plan.id,
      },
    },
    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCEL_URL,
  });

  return session.url;
};

// STRIPE WEBHOOK PROCESSOR

export const processStripeWebhook = async (payload, signature) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    throw new Error("Invalid Stripe webhook signature");
  }

  switch (event.type) {
    case "customer.subscription.created":
      await onSubscriptionCreated(event.data.object);
      break;

    case "customer.subscription.updated":
      await onSubscriptionUpdated(event.data.object);
      break;

    case "customer.subscription.deleted":
      await onSubscriptionDeleted(event.data.object);
      break;

    case "invoice.payment_failed":
      await onPaymentFailed(event.data.object);
      break;

    default:
      console.log("Unhandled Stripe event:", event.type);
  }
};

// WEBHOOK HELPERS

const onSubscriptionCreated = async (subscription) => {
  const { businessId, planId } = subscription.metadata || {};

  if (!businessId || !planId) return;

  // 1️⃣ Find existing active subscription to update history
  const existingActive = await prisma.businessSubscription.findFirst({
    where: { businessId, status: "ACTIVE" },
    orderBy: { createdAt: 'desc' }
  });

  if (existingActive) {
    const now = new Date();
    const newStatus = existingActive.endDate && existingActive.endDate < now ? "EXPIRED" : "INACTIVE";

    await prisma.businessSubscription.update({
      where: { id: existingActive.id },
      data: { status: newStatus }
    });
  }

  // 2️⃣ Create the new active subscription record
  await prisma.businessSubscription.create({
    data: {
      businessId,
      planId,
      stripeSubscriptionId: subscription.id,
      stripeStatus: subscription.status,
      stripePriceId: subscription.items.data[0].price.id,
      status: "ACTIVE",
      startDate: new Date(subscription.start_date * 1000),
      endDate: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
    },
  });
};

const onSubscriptionUpdated = async (subscription) => {
  await prisma.businessSubscription.updateMany({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      stripeStatus: subscription.status,
      endDate: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
      status:
        subscription.status === "active" || subscription.status === "trialing"
          ? "ACTIVE"
          : "EXPIRED",
    },
  });
};

const onSubscriptionDeleted = async (subscription) => {
  await prisma.businessSubscription.updateMany({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      stripeStatus: subscription.status,
      status: "CANCELLED",
      endDate: new Date(),
    },
  });
};

const onPaymentFailed = async (invoice) => {
  if (!invoice.subscription) return;

  await prisma.businessSubscription.updateMany({
    where: {
      stripeSubscriptionId: invoice.subscription,
    },
    data: {
      stripeStatus: "past_due",
      status: "EXPIRED",
    },
  });
};
