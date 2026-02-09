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

class EarnRewardService {
    /* 
       CREATE EARN REWARD
     */
    static async createEarnReward(data) {
        let {
            rewardName,
            earnPoint,
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
        const points = Number(earnPoint);
        if (isNaN(points) || points < 0) {
            throw new AppError(400, "earnPoint must be a valid number");
        }

        const expiryDaysNumber = Number(expiryDays);
        if (isNaN(expiryDaysNumber) || expiryDaysNumber <= 0) {
            throw new AppError(400, "expiryDays must be a positive number");
        }

        // ✅ CREATE EARN REWARD
        const createdEarnReward = await prisma.earnReward.create({
            data: {
                rewardName,
                earnPoint: points,
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
            action: "Created new earn reward",
            actionType: "CREATE",
            metadata: {
                rewardName,
                rewardType,
                earnPoint: points,
            },
        });

        return createdEarnReward;
    }

    /* 
       GET ALL EARN REWARDS
     */
    static async getAllEarnRewards() {
        return prisma.earnReward.findMany({
            orderBy: { createdAt: "desc" },
        });
    }

    static async getEarnRewardById(id) {
        return prisma.earnReward.findUnique({
            where: { id },
        });
    }

    static async getEarnRewardsByBusiness(businessId) {
        return prisma.earnReward.findMany({
            where: { businessId },
            orderBy: { createdAt: "desc" },
        });
    }

    static async getEarnRewardsByBranch(branchId) {
        return prisma.earnReward.findMany({
            where: { branchId },
            orderBy: { createdAt: "desc" },
        });
    }

    /* 
       UPDATE EARN REWARD
     */
    static async updateEarnReward(id, data) {
        if (!id) throw new Error("Earn Reward ID is required");

        const {
            rewardName,
            earnPoint,
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

        const updatedEarnReward = await prisma.earnReward.update({
            where: { id },
            data: {
                rewardName,
                earnPoint:
                    earnPoint !== undefined ? Number(earnPoint) : undefined,
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
            userId: updatedEarnReward.userId,
            businessId: updatedEarnReward.businessId,
            action: "Updated earn reward",
            actionType: "UPDATE",
            metadata: {
                rewardId: updatedEarnReward.id,
                rewardName: updatedEarnReward.rewardName,
                rewardStatus: updatedEarnReward.rewardStatus,
            },
        });

        return updatedEarnReward;
    }

    /* 
       DELETE EARN REWARD
     */
    static async deleteEarnReward(id) {
        const deletedEarnReward = await prisma.earnReward.delete({
            where: { id },
        });

        // 🔐 AUTO AUDIT LOG
        auditLog({
            userId: deletedEarnReward.userId,
            businessId: deletedEarnReward.businessId,
            action: "Deleted earn reward",
            actionType: "DELETE",
            metadata: {
                rewardId: deletedEarnReward.id,
                rewardName: deletedEarnReward.rewardName,
            },
        });

        return deletedEarnReward;
    }
}

export default EarnRewardService;
