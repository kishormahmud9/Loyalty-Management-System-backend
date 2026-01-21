// reward.service.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class RewardService {
  static async createReward(data) {
    const {
      rewardName,
      rewardPoints,
      rewardType,
      expiryDays,
      earningRule,
      reward,
      userId,
      businessId,
      branchId,
    } = data;

    // 🔐 HARD VALIDATION (prevents Prisma crash)
    if (!userId) throw new Error("userId is required");
    if (!businessId) throw new Error("businessId is required");
    if (!branchId) throw new Error("branchId is required");

    return prisma.reward.create({
      data: {
        rewardName,
        rewardPoints: Number(rewardPoints),
        rewardType,
        expiryDays: Number(expiryDays),
        earningRule,
        reward,
        userId,
        businessId,
        branchId,
      },
    });
  }

  static async getAllRewards() {
    return prisma.reward.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async getRewardById(id) {
    return prisma.reward.findUnique({
      where: { id },
    });
  }

  static async getRewardsByBusiness(businessId) {
    return prisma.reward.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getRewardsByBranch(branchId) {
    return prisma.reward.findMany({
      where: { branchId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateReward(id, data) {
  const {
    rewardName,
    rewardPoints,
    rewardType,
    expiryDays,
    earningRule,
    reward,
    businessId,
    branchId,
  } = data;

  if (!id) throw new Error("Reward ID is required");

  return prisma.reward.update({
    where: { id },
    data: {
      rewardName,
      rewardPoints: rewardPoints !== undefined ? Number(rewardPoints) : undefined,
      rewardType,
      expiryDays: expiryDays !== undefined ? Number(expiryDays) : undefined,
      earningRule,
      reward,
      businessId,
      branchId,
    },
  });
}

  static async deleteReward(id) {
    return prisma.reward.delete({
      where: { id },
    });
  }
}

export default RewardService;
