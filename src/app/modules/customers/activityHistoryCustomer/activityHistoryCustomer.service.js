import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";

const getActivityHistory = async (customerId, branchId) => {
    try {
        console.log(`🚀 [ACTIVITY_HISTORY] Processing request for customerId: ${customerId} | branchId: ${branchId || 'NONE'}`);

        // 0. If branchId is not provided, try to get it from the customer's profile
        if (!branchId) {
            const customer = await prisma.customer.findUnique({
                where: { id: customerId },
                select: { activeBranchId: true }
            });
            branchId = customer?.activeBranchId;
            console.log(`ℹ️ [ACTIVITY_HISTORY] Using activeBranchId from profile: ${branchId}`);
        }

        if (!branchId) {
            console.warn(`⚠️ [ACTIVITY_HISTORY] No branch selection found for customer ${customerId}`);
            throw new AppError(400, "No branch selected and no active branch found.");
        }

        // 1. Get Point Transactions (Filtered by branchId)
        const transactions = await prisma.pointTransaction.findMany({
            where: { customerId, branchId },
            include: { branch: { select: { name: true } } },
            orderBy: { createdAt: "desc" }
        });
        console.log(`✅ [ACTIVITY_HISTORY] Fetched ${transactions.length} point transactions.`);

        // 2. Get Claimed Rewards (Filtered by branchId)
        const claims = await prisma.claimReward.findMany({
            where: { customerId, branchId },
            include: {
                branch: { select: { name: true } },
                redeemReward: { select: { rewardName: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        console.log(`✅ [ACTIVITY_HISTORY] Fetched ${claims.length} claims.`);

        // 3. Format activities
        const activities = [
            ...transactions.map(t => ({
                id: t.id,
                type: "POINT_TRANSACTION",
                transactionType: t.type,
                icon: t.type === "EARN" ? "plus" : "minus",
                activityName: t.type === "EARN"
                    ? `${t.points} ${t.points === 1 ? 'Point' : 'Points'} earned at ${t.branch?.name || "Unknown Branch"}`
                    : `${t.points} Points redeemed at ${t.branch?.name || "Unknown Branch"}`,
                points: t.points,
                branchName: t.branch?.name || "Unknown Branch",
                date: t.createdAt
            })),
            ...claims.map(c => ({
                id: c.id,
                type: "CLAIM_REWARD",
                icon: "reward",
                activityName: `Reward '${c.redeemReward?.rewardName || "Unknown Reward"}' redeemed`,
                rewardName: c.redeemReward?.rewardName || "Unknown Reward",
                branchName: c.branch?.name || "Unknown Branch",
                date: c.createdAt
            }))
        ];

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 4. Calculate Summary (ALWAYS for specified/active branch)
        const history = await prisma.rewardHistory.findUnique({
            where: { customerId_branchId: { customerId, branchId } },
            include: { branch: { select: { name: true } } }
        });

        let summary = {
            branchId,
            branchName: "Unknown Branch",
            totalAvailablePoints: 0,
            claimableRewardsCount: 0,
            progressPercentage: 0,
            canClaim: false,
            pointsNeeded: 0,
            statusMessage: "No data found for this branch.",
            nextReward: null
        };

        if (history) {
            const userClaims = await prisma.claimReward.findMany({
                where: { customerId, branchId },
                select: { redeemRewardId: true, claimStatus: true }
            });

            const handledRewardIds = userClaims.map(c => c.redeemRewardId);
            const pendingClaimsCount = userClaims.filter(c => c.claimStatus === "CLAIM").length;

            const activeRewards = await prisma.redeemReward.findMany({
                where: { branchId, rewardStatus: "ACTIVE" },
                orderBy: { rewardPoints: "asc" }
            });

            const potentialRewards = activeRewards.filter(r => !handledRewardIds.includes(r.id));
            const currentPoints = history.rewardPoints;
            const canClaimNow = potentialRewards.filter(r => currentPoints >= r.rewardPoints);
            const minReward = potentialRewards.length > 0 ? potentialRewards[0] : null;

            let pointsNeeded = 0;
            let statusMessage = "No rewards available at this branch.";
            let progressPercentage = 0;

            if (minReward) {
                const threshold = minReward.rewardPoints;
                progressPercentage = Math.min(Math.round((currentPoints / threshold) * 100), 100);
                if (canClaimNow.length > 0) statusMessage = "you can claim reward";
                else {
                    pointsNeeded = threshold - currentPoints;
                    statusMessage = `${pointsNeeded} point needed to claim next reward`;
                }
            }

            summary = {
                branchId,
                branchName: history.branch?.name,
                totalAvailablePoints: currentPoints,
                claimableRewardsCount: pendingClaimsCount,
                progressPercentage,
                canClaim: canClaimNow.length > 0,
                pointsNeeded,
                statusMessage,
                nextReward: canClaimNow.length === 0 && minReward ? { name: minReward.rewardName, cost: minReward.rewardPoints } : null
            };
        }

        console.log(`✨ [ACTIVITY_HISTORY] Successfully prepared history for branch ${branchId}.`);
        return { summary, activities };

    } catch (error) {
        console.error(`🔥 [ACTIVITY_HISTORY_ERROR] Error for customer ${customerId}:`, error);
        throw error;
    }
};

export const ActivityHistoryCustomerService = {
    getActivityHistory
};
