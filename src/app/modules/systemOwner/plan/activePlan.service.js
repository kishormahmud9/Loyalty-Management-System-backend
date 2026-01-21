import prisma from "../../../prisma/client.js";

export const getActivePlanForBusinessService = async (businessId) => {
  try {
    if (!businessId) {
      return { error: "businessId is required" };
    }

    const subscription = await prisma.businessSubscription.findUnique({
      where: { businessId },
      include: {
        plan: true,
      },
    });

    if (!subscription || subscription.status !== "ACTIVE") {
      return { error: "No active plan found" };
    }

    // 🔍 Check expiry (Free Trial or any time-based plan)
    let isExpired = false;
    if (subscription.endDate && subscription.endDate < new Date()) {
      isExpired = true;
    }

    return {
      planId: subscription.plan.id,
      planName: subscription.plan.name,
      price: subscription.plan.price,
      limits: {
        maxStaff: subscription.plan.maxStaff,
        maxBranches: subscription.plan.maxBranches,
        maxCards: subscription.plan.maxCards,
      },
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      isExpired,
    };
  } catch (error) {
    console.error("Get Active Plan Service Error:", error.message);
    return { error: "Failed to fetch active plan" };
  }
};
