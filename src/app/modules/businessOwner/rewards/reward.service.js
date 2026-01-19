import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class RewardService {
  static async createReward(data) {
    return prisma.reward.create({
      data: {
        rewardName: data.rewardName,
        rewardPoints: Number(data.rewardPoints),
        rewardType: data.rewardType,
        expiryDays: Number(data.expiryDays),
        earningRule: data.earningRule,
        reward: data.reward,

        userId: data.userId,
        businessId: data.businessId,
        branchId: data.branchId,
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

  static async deleteReward(id) {
    return prisma.reward.delete({
      where: { id },
    });
  }
}

export default RewardService;
