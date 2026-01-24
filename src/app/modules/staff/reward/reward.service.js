import prisma from "../../../prisma/client.js";

export const getBranchRewards = async ({ staff }) => {
  const branchId = staff.branchId;

  const redeemRewards = await prisma.redeemReward.findMany({
    where: {
      branchId,
      rewardStatus: "ACTIVE",
    },
    orderBy: { createdAt: "desc" },
  });

  const earnRewards = await prisma.earnReward.findMany({
    where: {
      branchId,
      rewardStatus: "ACTIVE",
    },
    orderBy: { createdAt: "desc" },
  });

  const rewards = [
    ...redeemRewards.map((r) => ({
      id: r.id,
      createdDate: r.createdAt,
      rewardName: r.rewardName,
      rewardPoints: r.rewardPoints,
      rewardType: r.rewardType,
      expiryDays: r.expiryDays,
      earningRule: r.earningRule,
      status: r.rewardStatus,
    })),
    ...earnRewards.map((r) => ({
      id: r.id,
      createdDate: r.createdAt,
      rewardName: r.rewardName,
      rewardPoints: r.earnPoint,
      rewardType: r.rewardType,
      expiryDays: r.expiryDays,
      earningRule: r.earningRule,
      status: r.rewardStatus,
    })),
  ];

  return rewards;
};
