import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";

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
    // 0. Fallback to activeBranchId
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
