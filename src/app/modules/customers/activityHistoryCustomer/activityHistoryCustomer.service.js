import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";

const getActivityHistory = async (customerId, branchId) => {
    // 0. If branchId is not provided, try to get it from the customer's profile
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

    // 1. Get Point Transactions (Earn, Redeem Points)
    const transactionWhere = { customerId };
    if (branchId) transactionWhere.branchId = branchId;

    const transactions = await prisma.pointTransaction.findMany({
        where: transactionWhere,
        include: {
            branch: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    // 2. Get Claimed Rewards (Free item redeems)
    const claimWhere = { customerId };
    if (branchId) claimWhere.branchId = branchId;

    const claims = await prisma.claimReward.findMany({
        where: claimWhere,
        include: {
            branch: {
                select: { name: true }
            },
            redeemReward: {
                select: { rewardName: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    // 3. Merge and format activities
    const activities = [
        ...transactions.map(t => ({
            id: t.id,
            type: "POINT_TRANSACTION",
            transactionType: t.type, // EARN, REDEEM
            activityName: t.type === "EARN"
                ? `Earned ${t.points} points from ${t.branch?.name || "Unknown Branch"}`
                : `Redeemed ${t.points} points at ${t.branch?.name || "Unknown Branch"}`,
            points: t.points,
            branchName: t.branch?.name || "Unknown Branch",
            date: t.createdAt
        })),
        ...claims.map(c => ({
            id: c.id,
            type: "CLAIM_REWARD",
            activityName: `Claimed reward: ${c.redeemReward?.rewardName || "Unknown Reward"} at ${c.branch?.name || "Unknown Branch"}`,
            rewardName: c.redeemReward?.rewardName || "Unknown Reward",
            branchName: c.branch?.name || "Unknown Branch",
            date: c.createdAt
        }))
    ];

    // 4. Sort by date desc
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 5. Calculate Reward Progress Summary (if branchId is provided)
    let summary = null;
    if (branchId) {
        const history = await prisma.rewardHistory.findUnique({
            where: {
                customerId_branchId: { customerId, branchId }
            },
            include: {
                branch: { select: { name: true } }
            }
        });

        if (history) {
            const activeRewards = await prisma.redeemReward.findMany({
                where: { branchId, rewardStatus: "ACTIVE" },
                orderBy: { rewardPoints: "asc" } // Get cheapest first
            });

            const currentPoints = history.rewardPoints;
            const claimableRewards = activeRewards.filter(r => currentPoints >= r.rewardPoints);
            const minReward = activeRewards.length > 0 ? activeRewards[0] : null;

            let statusMessage = "No rewards available at this branch yet.";
            let progressPercentage = 0;
            let canClaim = claimableRewards.length > 0;
            let pointsNeeded = 0;

            if (minReward) {
                const threshold = minReward.rewardPoints;
                progressPercentage = Math.min(Math.round((currentPoints / threshold) * 100), 100);

                if (canClaim) {
                    statusMessage = "you can claim reward";
                } else {
                    pointsNeeded = threshold - currentPoints;
                    statusMessage = `${pointsNeeded} point needed to claim next reward`;
                }
            }

            summary = {
                branchId,
                branchName: history.branch?.name,
                totalAvailablePoints: currentPoints,
                claimableRewardsCount: claimableRewards.length,
                progressPercentage,
                canClaim,
                pointsNeeded,
                statusMessage,
                nextReward: !canClaim && minReward ? {
                    name: minReward.rewardName,
                    cost: minReward.rewardPoints
                } : null
            };
        }
    }

    return {
        summary,
        activities
    };
};

export const ActivityHistoryCustomerService = {
    getActivityHistory
};
