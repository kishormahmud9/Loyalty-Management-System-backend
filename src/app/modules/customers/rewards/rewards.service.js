
import { AppError } from "../../../errorHelper/appError.js";

const getRewardsByBranch = async (prisma, customerId, branchId) => {
    // Check if customer is registered at this branch
    const registration = await prisma.customerBranchData.findUnique({
        where: {
            customerId_branchId: {
                customerId,
                branchId
            }
        }
    });

    if (!registration) {
        throw new AppError(403, "Access denied. You are not registered at this branch.");
    }

    // Get active rewards for the branch
    const rewards = await prisma.redeemReward.findMany({
        where: {
            branchId,
            rewardStatus: "ACTIVE"
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return rewards;
};

export const CustomerRewardService = {
    getRewardsByBranch
};
