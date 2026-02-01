import prisma from "../../../prisma/client.js";

/**
 * Get earned points history for a customer
 * Shows only "EARN" type transactions with branch name and business logo
 */
const getEarnedPointsHistory = async (customerId) => {
    const transactions = await prisma.pointTransaction.findMany({
        where: {
            customerId: customerId,
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

    return transactions.map(t => ({
        transactionId: t.id,
        earnedPoints: t.points,
        branchName: t.branch?.name || "Unknown Branch",
        cafeImage: t.branch?.business?.cards?.[0]?.logo || null,
        date: t.createdAt
    }));
};

export const TransactionHistoryCustomerService = {
    getEarnedPointsHistory
};
