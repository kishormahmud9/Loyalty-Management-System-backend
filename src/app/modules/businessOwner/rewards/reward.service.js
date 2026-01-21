// reward.service.js
import { PrismaClient } from "@prisma/client";
import { AppError } from "../../../errorHelper/appError.js";

const prisma = new PrismaClient();
const rewardTypeMap = {
  "Free Item": "FREE_ITEM",
  "FREE_ITEM": "FREE_ITEM",
  "Earn": "EARN",
  "EARN": "EARN",
  "Redeem": "REDEEM",
  "REDEEM": "REDEEM",
};
class RewardService {
  static async createReward(data) {
    let {
      rewardName,
      rewardPoints,
      rewardType,
      earningRule,
      expiryDays,
      reward,
      rewardImageFilePath,
      rewardImage,
      userId,
      businessId,
      branchId,
    } = data;

    // 🔐 REQUIRED FIELDS
    if (!rewardName) throw new AppError(400, "rewardName is required");
    if (!userId) throw new AppError(401, "userId is required");
    if (!businessId) throw new AppError(400, "businessId is required");
    if (!branchId) throw new AppError(400, "branchId is required");

    // 🔁 MAP ENUMS
    rewardType = rewardTypeMap[rewardType];


    if (!rewardType) {
      throw new AppError(400, "Invalid rewardType");
    }

    if (!earningRule) {
      throw new AppError(400, "Invalid earningRule");
    }

    // 🔢 NUMBER VALIDATION
    const points = Number(rewardPoints);
    if (isNaN(points) || points < 0) {
      throw new AppError(400, "rewardPoints must be a valid number");
    }

    let expiryDaysNumber = Number(expiryDays);
    if (isNaN(expiryDaysNumber) || expiryDaysNumber <= 0) {
      throw new AppError(400, "expiryDays must be a positive number");
    }

    // ✅ CREATE
    return prisma.reward.create({
      data: {
        rewardName,
        rewardPoints: points,
        rewardType,
        earningRule,
        expiryDays: expiryDaysNumber,
        reward,

        rewardImageFilePath,
        rewardImage,

        rewardStatus: "ACTIVE",
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
      rewardStatus,
      expiryDays,
      earningRule,
      reward,
      businessId,
      branchId,
      rewardImageFilePath,
      rewardImage,
    } = data;

    if (!id) throw new Error("Reward ID is required");

    return prisma.reward.update({
      where: { id },
      data: {
        rewardName,
        rewardPoints: rewardPoints !== undefined ? Number(rewardPoints) : undefined,
        rewardType,
        rewardStatus,
        expiryDays: expiryDays !== undefined ? Number(expiryDays) : undefined,
        earningRule,
        reward,
        businessId,
        branchId,
        rewardImageFilePath,
        rewardImage,
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
