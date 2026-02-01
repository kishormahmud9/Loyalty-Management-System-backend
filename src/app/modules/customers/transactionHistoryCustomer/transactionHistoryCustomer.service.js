import prisma from "../../../prisma/client.js";

/**
 * Get earned points history for a customer
 * Shows only "EARN" type transactions with branch name and business logo
 */
const getEarnedPointsHistory = async (customerId, branchId) => {
    try {
        console.log(`🚀 [TX_HISTORY] Fetching earned history for customerId: ${customerId} | branchId: ${branchId || 'NONE'}`);

        // 0. If branchId is not provided, try to get it from the customer's profile
        if (!branchId) {
            const customer = await prisma.customer.findUnique({
                where: { id: customerId },
                select: { activeBranchId: true }
            });
            branchId = customer?.activeBranchId;
            console.log(`ℹ️ [TX_HISTORY] Using activeBranchId from profile: ${branchId}`);
        }

        if (!branchId) {
            console.warn(`⚠️ [TX_HISTORY] No branch selection found for customer ${customerId}`);
            throw new AppError(400, "No branch selected and no active branch found.");
        }

        const transactions = await prisma.pointTransaction.findMany({
            where: {
                customerId: customerId,
                branchId: branchId,
                type: "EARN"
            },
            select: {
                id: true,
                points: true,
                createdAt: true,
                branch: {
                    select: {
                        name: true,
                        business: {
                            select: {
                                cards: {
                                    take: 1,
                                    select: {
                                        logo: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        console.log(`✅ [TX_HISTORY] Found ${transactions.length} earned transactions for customer ${customerId}.`);

        const formatted = transactions.map(t => ({
            transactionId: t.id,
            earnedPoints: t.points,
            branchName: t.branch?.name || "Unknown Branch",
            cafeImage: t.branch?.business?.cards?.[0]?.logo || null,
            date: t.createdAt
        }));

        return formatted;

    } catch (error) {
        console.error(`🔥 [TX_HISTORY_ERROR] Failed to fetch history for ${customerId}:`, error);
        throw error;
    }
};

export const TransactionHistoryCustomerService = {
    getEarnedPointsHistory
};
