import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";

const getActivityHistory = async (customerId, branchId) => {
    try {
        console.log(`� [ACTIVITY_HISTORY] Processing request for customerId: ${customerId} | branchId: ${branchId || 'NONE'}`);

        // 0. Determine which branch to show the SUMMARY for
        let summaryBranchId = branchId;

        if (!summaryBranchId) {
            const customer = await prisma.customer.findUnique({
                where: { id: customerId },
                select: { activeBranchId: true }
            });
            summaryBranchId = customer?.activeBranchId;
            console.log(`ℹ️ [ACTIVITY_HISTORY] Defaulting summary to activeBranchId: ${summaryBranchId}`);
        }

        // 1. Get Point Transactions
        // Note: filtered by 'branchId' (from req), NOT summaryBranchId (from fallback)
        const transactionWhere = { customerId };
        if (branchId) transactionWhere.branchId = branchId;

        const transactions = await prisma.pointTransaction.findMany({
            where: transactionWhere,
            include: { branch: { select: { name: true } } },
            orderBy: { createdAt: "desc" }
        });
        console.log(`✅ [ACTIVITY_HISTORY] Fetched ${transactions.length} point transactions.`);

        // 2. Get Claimed Rewards
        const claimWhere = { customerId };
        if (branchId) claimWhere.branchId = branchId;

        const claims = await prisma.claimReward.findMany({
            where: claimWhere,
            include: {
                branch: { select: { name: true } },
                redeemReward: { select: { rewardName: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        console.log(`✅ [ACTIVITY_HISTORY] Fetched ${claims.length} claims.`);

        // ... (activities formatting remains same)
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

        // 4. Calculate Summary (using summaryBranchId)
        let summary = {
            branchId: summaryBranchId || "NONE",
            branchName: "None",
            totalAvailablePoints: 0,
            claimableRewardsCount: 0,
            progressPercentage: 0,
            canClaim: false,
            pointsNeeded: 0,
            statusMessage: "No branch selected.",
            nextReward: null
        };

        if (summaryBranchId) {
            const history = await prisma.rewardHistory.findUnique({
                where: { customerId_branchId: { customerId, branchId: summaryBranchId } },
                include: { branch: { select: { name: true } } }
            });

            if (history) {
                const userClaims = await prisma.claimReward.findMany({
                    where: { customerId, branchId: summaryBranchId },
                    select: { redeemRewardId: true, claimStatus: true }
                });

                const handledRewardIds = userClaims.map(c => c.redeemRewardId);
                const pendingClaimsCount = userClaims.filter(c => c.claimStatus === "CLAIM").length;

                const activeRewards = await prisma.redeemReward.findMany({
                    where: { branchId: summaryBranchId, rewardStatus: "ACTIVE" },
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
                    branchId: summaryBranchId,
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
        }

        console.log(`✨ [ACTIVITY_HISTORY] Successfully prepared history with ${activities.length} activities.`);
        return { summary, activities };

    } catch (error) {
        console.error(`🔥 [ACTIVITY_HISTORY_ERROR] Error for customer ${customerId}:`, error);
        throw error;
    }
};

export const ActivityHistoryCustomerService = {
    getActivityHistory
};
