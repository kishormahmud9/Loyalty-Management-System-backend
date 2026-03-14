import prisma from "../../../prisma/client.js";

export const getAllPlansService = async () => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: "asc" },
    });

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      features: {
        maxCards: plan.maxCards,
        maxBranches: plan.maxBranches,
        maxStaff: plan.maxStaff,
      },
    }));
  } catch (error) {
    console.error("Plan Service Error:", error.message);
    return [];
  }
};

export const activatePlanForBusinessService = async (payload) => {
  try {
    const { businessId, planId, userId, billingCycle } = payload;
    // 🔐 Guard Prisma models
    if (!prisma.plan || !prisma.businessSubscription) {
      return { error: "Plan system not ready" };
    }

    // 1️⃣ Fetch plan
    const plan = await prisma.plan.findFirst({
      where: {
        id: planId,
        isActive: true,
      },
    });

    if (!plan) {
      return { error: "Invalid or inactive plan" };
    }

    // 2️⃣ Fetch business
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return { error: "Business not found" };
    }

    // 3️⃣ Calculate renewal date (endDate) and select price
    let endDate = new Date();
    let price = plan.monthlyPrice;

    if (plan.name === "Free Trial") {
      endDate.setDate(endDate.getDate() + 7);
      price = 0;
    } else if (billingCycle === "YEARLY") {
      endDate.setDate(endDate.getDate() + 365);
      price = plan.yearlyPrice;
    } else {
      // Default to MONTHLY (30 days)
      endDate.setDate(endDate.getDate() + 30);
      price = plan.monthlyPrice;
    }

    // 4️⃣ Find existing subscription to update
    const existing = await prisma.businessSubscription.findFirst({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });

    const subscriptionData = {
      planId,
      status: "ACTIVE",
      startDate: new Date(),
      endDate,
      planName: plan.name,
      price: price,
      maxBranches: plan.maxBranches,
      maxStaff: plan.maxStaff,
      maxCards: plan.maxCards,
    };

    if (existing && existing.status === "ACTIVE") {
      const updated = await prisma.businessSubscription.update({
        where: { id: existing.id },
        data: subscriptionData,
      });

      return { subscription: updated };
    }

    const created = await prisma.businessSubscription.create({
      data: {
        ...subscriptionData,
        businessId,
      },
    });

    return { subscription: created };
  } catch (err) {
    console.error("SERVICE ERROR:", err.message);

    // ❌ NEVER THROW
    return { error: "Plan activation failed internally" };
  }
};

export const createPlanService = async (data) => {
  try {
    const {
      name,
      monthlyPrice,
      yearlyPrice,
      maxBranches,
      maxStaff,
      maxCards,
      stripeMonthlyPriceId,
      stripeYearlyPriceId,
    } = data;

    // 🔒 Validation (NO THROW)
    if (!name) return { error: "Plan name is required" };
    if (monthlyPrice == null || monthlyPrice < 0)
      return { error: "Invalid monthly price" };
    if (yearlyPrice == null || yearlyPrice < 0)
      return { error: "Invalid yearly price" };
    if (maxBranches == null || maxBranches < 0)
      return { error: "Invalid maxBranches" };
    if (maxStaff == null || maxStaff < 0) return { error: "Invalid maxStaff" };
    if (maxCards == null || maxCards < 0) return { error: "Invalid maxCards" };


    // 🔎 Check duplicate plan name
    const existing = await prisma.plan.findUnique({
      where: { name },
    });

    if (existing) {
      return { error: "Plan name already exists" };
    }

    // ✅ Create plan
    const plan = await prisma.plan.create({
      data: {
        name,
        monthlyPrice,
        yearlyPrice,
        maxBranches,
        maxStaff,
        maxCards,

        // ✅ NEW (Stripe)
        stripeMonthlyPriceId,
        stripeYearlyPriceId,

        isActive: true,
      },
    });

    return { plan };
  } catch (error) {
    console.error("Create Plan Service Error:", error.message);
    return { error: "Failed to create plan" };
  }
};

export const updatePlanService = async (planId, data) => {
  try {
    if (!planId) {
      return { error: "Plan ID is required" };
    }

    const {
      name,
      monthlyPrice,
      yearlyPrice,
      maxBranches,
      maxStaff,
      maxCards,
      isActive,
      stripeMonthlyPriceId,
      stripeYearlyPriceId,
    } = data;

    // 🔎 Check plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return { error: "Plan not found" };
    }

    // 🔒 Validate fields (only if provided)
    if (monthlyPrice !== undefined && monthlyPrice < 0) {
      return { error: "Invalid monthly price" };
    }
 
    if (yearlyPrice !== undefined && yearlyPrice < 0) {
      return { error: "Invalid yearly price" };
    }

    if (maxBranches !== undefined && maxBranches < 0) {
      return { error: "Invalid maxBranches" };
    }

    if (maxStaff !== undefined && maxStaff < 0) {
      return { error: "Invalid maxStaff" };
    }

    if (maxCards !== undefined && maxCards < 0) {
      return { error: "Invalid maxCards" };
    }

    // 🔎 Prevent duplicate plan name
    if (name && name !== existingPlan.name) {
      const duplicate = await prisma.plan.findUnique({
        where: { name },
      });

      if (duplicate) {
        return { error: "Plan name already exists" };
      }
    }

    // ✅ Update plan
    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        name,
        monthlyPrice,
        yearlyPrice,
        maxBranches,
        maxStaff,
        maxCards,
        isActive,
        stripeMonthlyPriceId,
        stripeYearlyPriceId,
      },
    });

    return { plan: updatedPlan };
  } catch (error) {
    console.error("Update Plan Service Error:", error.message);
    return { error: "Failed to update plan" };
  }
};

export const deactivePlanService = async (planId) => {
  try {
    if (!planId) {
      return { error: "Plan ID is required" };
    }

    // 🔎 Check plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return { error: "Plan not found" };
    }

    // ❌ Already inactive
    if (!plan.isActive) {
      return { error: "Plan is already inactive" };
    }

    // ✅ Soft delete
    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        isActive: false,
      },
    });

    return { plan: updatedPlan };
  } catch (error) {
    console.error("Delete Plan Service Error:", error.message);
    return { error: "Failed to delete plan" };
  }
};

export const reactivatePlanService = async (planId) => {
  try {
    if (!planId) {
      return { error: "Plan ID is required" };
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return { error: "Plan not found" };
    }

    // Already active
    if (plan.isActive) {
      return { error: "Plan is already active" };
    }

    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        isActive: true,
      },
    });

    return { plan: updatedPlan };
  } catch (error) {
    console.error("Reactivate Plan Service Error:", error.message);
    return { error: "Failed to activate plan" };
  }
};

export const hardDeletePlanService = async (planId) => {
  try {
    if (!planId) {
      return { error: "Plan ID is required" };
    }

    // 🔎 Check plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        businessSubscriptions: {
          select: { id: true },
        },
      },
    });

    if (!plan) {
      return { error: "Plan not found" };
    }

    // 🚫 Prevent deleting used plans
    if (plan.businessSubscriptions.length > 0) {
      return {
        error: "Plan is already assigned to businesses and cannot be deleted",
      };
    }

    // 🗑️ HARD DELETE
    await prisma.plan.delete({
      where: { id: planId },
    });

    return { success: true };
  } catch (error) {
    console.error("Hard Delete Plan Error:", error.message);
    return { error: "Failed to delete plan" };
  }
};
