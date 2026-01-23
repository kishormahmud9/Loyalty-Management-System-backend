import prisma from "../../../prisma/client.js";

const getMyHistory = async (customerId) => {
    return prisma.rewardHistory.findMany({
        where: { customerId },
        include: {
            business: {
                select: {
                    id: true,
                    name: true,
                    industry: true
                }
            },
            branch: {
                select: {
                    id: true,
                    name: true,
                    address: true
                }
            }
        },
        orderBy: { updatedAt: "desc" }
    });
};

const getMyHistoryByBranch = async (customerId, branchId) => {
    return prisma.rewardHistory.findUnique({
        where: {
            customerId_branchId: {
                customerId,
                branchId
            }
        },
        include: {
            business: true,
            branch: true
        }
    });
}

export const CustomerRewardHistoryService = {
    getMyHistory,
    getMyHistoryByBranch
};
