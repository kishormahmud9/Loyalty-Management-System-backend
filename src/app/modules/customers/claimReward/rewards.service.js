
import { AppError } from "../../../errorHelper/appError.js";

const getRewardsByBranch = async (prisma, customerId, branchId) => {
    // 0. If branchId is not provided, use activeBranchId
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
    try {
        console.log(`🚀 [REWARD_CLAIM] Starting claim for Customer: ${customerId} | RewardID: ${redeemRewardId}`);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Fetch the reward to get branchId and point cost
            const reward = await tx.redeemReward.findUnique({
                where: { id: redeemRewardId }
            });

            if (!reward) {
                console.warn(`⚠️ [REWARD_CLAIM] Reward ${redeemRewardId} not found`);
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
                console.warn(`⚠️ [REWARD_CLAIM] Customer ${customerId} already claimed reward ${redeemRewardId}`);
                throw new AppError(400, "You have already claimed this reward");
            }

            // 3. Check if customer has enough points
            const history = await tx.rewardHistory.findUnique({
                where: {
                    customerId_branchId: {
                        customerId,
                        branchId: reward.branchId
                    }
                }
            });

            if (!history || history.rewardPoints < reward.rewardPoints) {
                console.warn(`🔓 [REWARD_CLAIM_FAILED] Insufficient points for ${customerId}. Has: ${history?.rewardPoints || 0}, Needs: ${reward.rewardPoints}`);
                throw new AppError(400, `Insufficient points. You have ${history?.rewardPoints || 0} and need ${reward.rewardPoints}`);
            }

            // 4. Deduct points
            await tx.rewardHistory.update({
                where: { id: history.id },
                data: {
                    rewardPoints: { decrement: reward.rewardPoints }
                }
            });

            // 5. Create claim record
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

            console.log(`✅ [REWARD_CLAIM_SUCCESS] Customer ${customerId} redeemed '${reward.rewardName}' for ${reward.rewardPoints} points.`);
            return claim;
        });

        return result;

    } catch (error) {
        console.error(`🔥 [REWARD_CLAIM_ERROR] Failed for customer ${customerId}:`, error.message);
        throw error;
    }
};

const getRewardsWithClaimStatus = async (prisma, customerId, branchId) => {
    // 0. If branchId is not provided, use activeBranchId
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
