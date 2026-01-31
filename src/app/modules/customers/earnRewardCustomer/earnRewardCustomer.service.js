import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";

const getEarnRewardsByBranch = async (customerId, branchId) => {
    // 0. Fallback to activeBranchId if branchId is missing
    if (!branchId) {
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            select: { activeBranchId: true }
        });
        branchId = customer?.activeBranchId;
    }

    if (!branchId) {
        throw new AppError(400, "No branch selected and no active branch found.");
    }

    // 1. Fetch active earn rewards for the branch
    const earnRewards = await prisma.earnReward.findMany({
        where: {
            branchId,
            rewardStatus: "ACTIVE"
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return earnRewards;
};

export const EarnRewardCustomerService = {
    getEarnRewardsByBranch
};
