import prisma from "../../prisma/client.js";

export const checkSubscriptionStatus = async (businessId) => {
  const subscription = await prisma.businessSubscription.findFirst({
    where: { businessId, status: "ACTIVE" },
  });

  if (!subscription) {
    return { error: "No active subscription found" };
  }

  if (subscription.endDate && subscription.endDate < new Date()) {
    return {
      expired: true,
      message: "Your free trial has expired. Please upgrade your plan.",
    };
  }

  return {
    expired: false,
    subscription,
  };
};

