import prisma from "../../../prisma/client.js";

/**
 * Get earned points history for a customer
 * Shows only "EARN" type transactions with branch name and business logo
 */
const getEarnedPointsHistory = async (customerId, branchId) => {
    try {
        console.log(`🚀 [TX_HISTORY] Fetching earned history for customerId: ${customerId} | branchId: ${branchId || 'ALL'}`);

        const where = {
            customerId: customerId,
            type: "EARN"
        };

        if (branchId) {
            where.branchId = branchId;
        }

        const transactions = await prisma.pointTransaction.findMany({
            where,
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
