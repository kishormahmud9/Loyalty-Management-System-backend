import prisma from "../../../prisma/client.js";

export const searchCustomerService = async ({ body, staff }) => {
  const { code } = body;

  if (!code) {
    throw new Error("Customer code is required");
  }

  const { branchId } = staff;

  const customer = await prisma.customer.findUnique({
    where: { qrCode: code },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  const customerBranch = await prisma.customerBranchData.findUnique({
    where: {
      customerId_branchId: {
        customerId: customer.id,
        branchId,
      },
    },
  });

  if (!customerBranch) {
    throw new Error("Customer not found");
  }

  const rewardHistory = await prisma.rewardHistory.findUnique({
    where: {
      customerId_branchId: {
        customerId: customer.id,
        branchId,
      },
    },
  });

  return {
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    },
    reward: {
      rewardPoints: rewardHistory?.rewardPoints || 0,
      activeRewards: rewardHistory?.activeRewards || 0,
      availableRewards: rewardHistory?.availableRewards || 0,
      lastRewardReceived: rewardHistory?.lastRewardReceived || null,
      cardExpireDate: rewardHistory?.cardExpireDate || null,
      earningRule: rewardHistory?.earningRule || null,
      walletApp: rewardHistory?.walletApp || null,
    },
  };
};

export const addPointsInstantService = async ({ body, staff }) => {
  const { customerId, points } = body;

  if (!customerId || !points || points <= 0) {
    throw new Error("Invalid request data");
  }

  const { branchId, businessId, id: staffId } = staff;

  // 1️⃣ Ensure customer belongs to staff branch
  const customerBranch = await prisma.customerBranchData.findUnique({
    where: {
      customerId_branchId: {
        customerId,
        branchId,
      },
    },
  });

  if (!customerBranch) {
    throw new Error("Customer not found in your branch");
  }

  // 2️⃣ Atomic transaction (VERY IMPORTANT)
  const result = await prisma.$transaction(async (tx) => {
    // Create transaction log
    const transaction = await tx.pointTransaction.create({
      data: {
        businessId,
        branchId,
        staffId,
        customerId,
        points,
        type: "EARN",
      },
    });

    // Update reward history
    const reward = await tx.rewardHistory.upsert({
      where: {
        customerId_branchId: {
          customerId,
          branchId,
        },
      },
      update: {
        rewardPoints: { increment: points },
        availableRewards: { increment: points },
        lastRewardReceived: new Date(),
      },
      create: {
        customerId,
        businessId,
        branchId,
        rewardPoints: points,
        availableRewards: points,
        activeRewards: 0,
        lastRewardReceived: new Date(),
      },
    });

    return { transaction, reward };
  });

  return {
    transactionId: result.transaction.id,
    reward: {
      rewardPoints: result.reward.rewardPoints,
      availableRewards: result.reward.availableRewards,
      lastRewardReceived: result.reward.lastRewardReceived,
    },
  };
};
