import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";
import { auditLog } from "../../../utils/auditLogger.js";

const rewardTypeMap = {
  "Free Item": "FREE_ITEM",
  FREE_ITEM: "FREE_ITEM",
  Earn: "EARN",
  EARN: "EARN",
  Redeem: "REDEEM",
  REDEEM: "REDEEM",
};

class RedeemRewardService {
  /* 
     CREATE REDEEM REWARD
   */
  static async createRedeemReward(data) {
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

    const expiryDaysNumber = Number(expiryDays);
    if (isNaN(expiryDaysNumber) || expiryDaysNumber <= 0) {
      throw new AppError(400, "expiryDays must be a positive number");
    }

    // ✅ CREATE REDEEM REWARD
    const createdRedeemReward = await prisma.redeemReward.create({
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

    // 🔐 AUTO AUDIT LOG (NON-BLOCKING)
    auditLog({
      userId,
      businessId,
      action: "Created new redeem reward",
      actionType: "CREATE",
      metadata: {
        rewardName,
        rewardType,
        rewardPoints: points,
      },
    });

    return createdRedeemReward;
  }

  /* 
     GET ALL REDEEM REWARDS
   */
  static async getAllRedeemRewards() {
    return prisma.redeemReward.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async getRedeemRewardById(id) {
    return prisma.redeemReward.findUnique({
      where: { id },
    });
  }

  static async getRedeemRewardsByBusiness(businessId) {
    return prisma.redeemReward.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getRedeemRewardsByBranch(branchId) {
    return prisma.redeemReward.findMany({
      where: { branchId },
      orderBy: { createdAt: "desc" },
    });
  }

  /* 
     UPDATE REDEEM REWARD
   */
  static async updateRedeemReward(id, data) {
    if (!id) throw new AppError(400, "Redeem Reward ID is required");

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

    // 🔁 MAP ENUM if provided
    let mappedRewardType = undefined;
    if (rewardType) {
      mappedRewardType = rewardTypeMap[rewardType];
      if (!mappedRewardType) {
        throw new AppError(400, "Invalid rewardType");
      }
    }

    const updatedRedeemReward = await prisma.redeemReward.update({
      where: { id },
      data: {
        rewardName,
        rewardPoints:
          rewardPoints !== undefined ? Number(rewardPoints) : undefined,
        rewardType: mappedRewardType,
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

    // 🔐 AUTO AUDIT LOG
    auditLog({
      userId: updatedRedeemReward.userId,
      businessId: updatedRedeemReward.businessId,
      action: "Updated redeem reward",
      actionType: "UPDATE",
      metadata: {
        rewardId: updatedRedeemReward.id,
        rewardName: updatedRedeemReward.rewardName,
        rewardStatus: updatedRedeemReward.rewardStatus,
      },
    });

    return updatedRedeemReward;
  }

  /* 
     DELETE REDEEM REWARD
   */
  static async deleteRedeemReward(id) {
    const deletedRedeemReward = await prisma.redeemReward.delete({
      where: { id },
    });

    // 🔐 AUTO AUDIT LOG
    auditLog({
      userId: deletedRedeemReward.userId,
      businessId: deletedRedeemReward.businessId,
      action: "Deleted redeem reward",
      actionType: "DELETE",
      metadata: {
        rewardId: deletedRedeemReward.id,
        rewardName: deletedRedeemReward.rewardName,
      },
    });

    return deletedRedeemReward;
  }
}

export default RedeemRewardService;
