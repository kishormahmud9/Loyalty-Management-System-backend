import prisma from "../../../prisma/client.js";

export const getAllPlansService = async () => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
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

export const activatePlanForBusinessService = async ({
  businessId,
  planId,
  userId,
}) => {
  try {
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

    // 3️⃣ Existing subscription
    const existing = await prisma.businessSubscription.findUnique({
      where: { businessId },
    });

    let endDate = null;
    if (plan.name === "Free Trial") {
      endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
    }

    if (existing) {
      const updated = await prisma.businessSubscription.update({
        where: { businessId },
        data: {
          planId,
          status: "ACTIVE",
          startDate: new Date(),
          endDate,
        },
      });

      return { subscription: updated };
    }

    const created = await prisma.businessSubscription.create({
      data: {
        businessId,
        planId,
        status: "ACTIVE",
        startDate: new Date(),
        endDate,
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
    const { name, price, maxBranches, maxStaff, maxCards } = data;

    // 🔒 Validation (NO THROW)
    if (!name) return { error: "Plan name is required" };
    if (price == null || price < 0) return { error: "Invalid price" };
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
        price,
        maxBranches,
        maxStaff,
        maxCards,
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

    const { name, price, maxBranches, maxStaff, maxCards, isActive } = data;

    // 🔎 Check plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return { error: "Plan not found" };
    }

    // 🔒 Validate fields (only if provided)
    if (price !== undefined && price < 0) {
      return { error: "Invalid price" };
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
        price,
        maxBranches,
        maxStaff,
        maxCards,
        isActive,
      },
    });

    return { plan: updatedPlan };
  } catch (error) {
    console.error("Update Plan Service Error:", error.message);
    return { error: "Failed to update plan" };
  }
};

export const deletePlanService = async (planId) => {
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
