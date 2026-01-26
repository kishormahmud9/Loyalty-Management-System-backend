
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

// Public method to get rewards by branch without registration check
const getRedeemRewardsByBranch = async (prisma, branchId) => {
    return await prisma.redeemReward.findMany({
        where: {
            branchId,
            rewardStatus: "ACTIVE"
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

const claimReward = async (prisma, customerId, redeemRewardId) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Fetch the reward to get branchId and point cost
        const reward = await tx.redeemReward.findUnique({
            where: { id: redeemRewardId }
        });

        if (!reward) {
            throw new AppError(404, "Redeem Reward not found");
        }

        // 2. Check if already claimed
        const existingClaim = await tx.claimReward.findFirst({
            where: {
                customerId,
                redeemRewardId
            }
        });

        if (existingClaim) {
            throw new AppError(400, "You have already claimed this reward");
        }

        // 3. Check if customer has enough points in this branch
        const history = await tx.rewardHistory.findUnique({
            where: {
                customerId_branchId: {
                    customerId,
                    branchId: reward.branchId
                }
            }
        });

        if (!history || history.rewardPoints < reward.rewardPoints) {
            throw new AppError(400, `Insufficient points. You have ${history?.rewardPoints || 0} and need ${reward.rewardPoints}`);
        }

        // 3. Deduct points from RewardHistory
        await tx.rewardHistory.update({
            where: { id: history.id },
            data: {
                rewardPoints: { decrement: reward.rewardPoints }
            }
        });

        // 4. Create the claim record
        const claim = await tx.claimReward.create({
            data: {
                redeemRewardId,
                customerId,
                branchId: reward.branchId,
                claimStatus: 'CLAIMED'
            },
            include: {
                redeemReward: true
            }
        });

        return claim;
    });
};

const getRewardsWithClaimStatus = async (prisma, customerId, branchId) => {
    // 1. Get all active rewards for the branch
    const allRewards = await prisma.redeemReward.findMany({
        where: {
            branchId,
            rewardStatus: "ACTIVE"
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    // 2. Get rewards already claimed by this customer in this branch
    const userClaims = await prisma.claimReward.findMany({
        where: {
            customerId,
            branchId
        },
        select: {
            redeemRewardId: true,
            claimStatus: true
        }
    });

    // 3. Create a map of claimed reward IDs for quick lookup
    const claimedMap = new Map(userClaims.map(c => [c.redeemRewardId, c.claimStatus]));

    // 4. Map rewards and attach status
    const result = allRewards.map(reward => ({
        ...reward,
        isClaimed: claimedMap.has(reward.id),
        claimStatus: claimedMap.get(reward.id) || "CLAIM"
    }));

    return result;
};

export const CustomerRewardService = {
    getRewardsByBranch,
    getRedeemRewardsByBranch,
    claimReward,
    getRewardsWithClaimStatus
};
