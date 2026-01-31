import {
  createCheckoutSession,
  processStripeWebhook,
} from "../payment/payment.service.js";

// Create Stripe Checkout Session

export const createCheckout = async (req, res, next) => {
  try {
    const { planId, billingCycle } = req.body;

    if (!planId || !billingCycle) {
      return res.status(400).json({
        message: "planId and billingCycle are required",
      });
    }

    const checkoutUrl = await createCheckoutSession({
      user: req.user,
      planId,
      billingCycle,
    });

    res.status(200).json({ url: checkoutUrl });
  } catch (error) {
    next(error);
  }
};

// Stripe Webhook Handler

export const handleStripeWebhook = async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"];

    await processStripeWebhook(req.body, signature);

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
