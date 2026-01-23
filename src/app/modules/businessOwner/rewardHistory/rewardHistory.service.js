import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";
import { auditLog } from "../../../utils/auditLogger.js";

const increaseRewardPoints = async (data) => {
    let {
        qrCode,
        businessId,
        branchId,
        points,
        loggedInUserId, // For audit log and context
        earningRule,
        cardExpireDate,
        activeRewards,
        availableRewards,
        walletApp
    } = data;

    if (!qrCode || points === undefined) {
        throw new AppError(400, "qrCode and points are required");
    }

    // 1. Resolve and Verify businessId and branchId
    const staffProfile = await prisma.staff.findUnique({
        where: { userId: loggedInUserId }
    });

    if (staffProfile) {
        // Staff member: use their fixed business and branch
        if (businessId && businessId !== staffProfile.businessId) {
            throw new AppError(403, "You do not have access to this business");
        }
        if (branchId && branchId !== staffProfile.branchId) {
            throw new AppError(403, "You do not have access to this branch");
        }
        businessId = staffProfile.businessId;
        branchId = staffProfile.branchId;
    } else {
        // Business Owner: Verify or Infer
        if (businessId) {
            const business = await prisma.business.findFirst({
                where: { id: businessId, ownerId: loggedInUserId }
            });
            if (!business) {
                throw new AppError(403, "You do not own this business");
            }
        } else {
            // Try to infer business
            const ownerBusinesses = await prisma.business.findMany({
                where: { ownerId: loggedInUserId }
            });
            if (ownerBusinesses.length === 1) {
                businessId = ownerBusinesses[0].id;
            } else if (ownerBusinesses.length === 0) {
                throw new AppError(403, "You do not own any business");
            } else {
                throw new AppError(400, "businessId is required (multiple businesses found)");
            }
        }

        if (!branchId) {
            // Try to infer branch
            const branches = await prisma.branch.findMany({
                where: { businessId }
            });
            if (branches.length === 1) {
                branchId = branches[0].id;
            } else {
                throw new AppError(400, "branchId is required (multiple branches found)");
            }
        } else {
            // Verify branch belongs to the business
            const branch = await prisma.branch.findFirst({
                where: { id: branchId, businessId }
            });
            if (!branch) {
                throw new AppError(400, "Branch does not belong to chosen business");
            }
        }
    }

    // 2. Find customer by qrCode
    const customer = await prisma.customer.findUnique({
        where: { qrCode }
    });

    if (!customer) {
        throw new AppError(404, "Customer not found with this QR code");
    }

    const customerId = customer.id;

    // 3. Verify if customer is registered at this branch
    const registration = await prisma.customerBranchData.findFirst({
        where: {
            customerId,
            branchId,
            businessId
        }
    });

    if (!registration) {
        throw new AppError(403, "Customer is not registered at this branch");
    }

    // 4. Update or create reward history for this customer-branch pair
    const history = await prisma.rewardHistory.upsert({
        where: {
            customerId_branchId: {
                customerId,
                branchId
            }
        },
        update: {
            rewardPoints: { increment: Number(points) },
            lastRewardReceived: new Date()
        },
        create: {
            customerId,
            businessId,
            branchId,
            rewardPoints: Number(points),
            lastRewardReceived: new Date(),
            activeRewards: 0,
            availableRewards: 0
        }
    });

    // Log transaction
    await auditLog({
        userId: loggedInUserId,
        businessId,
        action: `Increased reward points for customer ${customerId} (QR: ${qrCode}) by ${points}`,
        actionType: "UPDATE",
        metadata: {
            customerId,
            qrCode,
            points,
            branchId
        }
    });

    return history;
};

const getRewardHistoryByBranch = async (customerId, branchId) => {
    return prisma.rewardHistory.findUnique({
        where: {
            customerId_branchId: {
                customerId,
                branchId
            }
        },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            branch: true,
            business: true
        }
    });
};

const getHistoryByQrCode = async (data) => {
    let { qrCode, branchId, businessId, loggedInUserId } = data;

    if (!qrCode) {
        throw new AppError(400, "qrCode is required");
    }

    // 1. Resolve and Verify businessId and branchId (same logic as increaseRewardPoints)
    const staffProfile = await prisma.staff.findUnique({
        where: { userId: loggedInUserId }
    });

    if (staffProfile) {
        businessId = staffProfile.businessId;
        branchId = staffProfile.branchId;
    } else {
        if (!businessId) {
            const ownerBusinesses = await prisma.business.findMany({
                where: { ownerId: loggedInUserId }
            });
            if (ownerBusinesses.length === 1) businessId = ownerBusinesses[0].id;
            else if (ownerBusinesses.length > 1) {
                // If branchId is provided, we can find businessId from it
                if (branchId) {
                    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
                    if (branch) businessId = branch.businessId;
                }
            }
        }
        if (!branchId && businessId) {
            const branches = await prisma.branch.findMany({ where: { businessId } });
            if (branches.length === 1) branchId = branches[0].id;
        }
    }

    if (!businessId || !branchId) {
        throw new AppError(400, "Could not determine business or branch context. Please provide IDs.");
    }

    // 2. Find customer
    const customer = await prisma.customer.findUnique({
        where: { qrCode }
    });

    if (!customer) {
        throw new AppError(404, "Customer not found");
    }

    // 3. Find or create (using upsert logic for consistency) the history
    const history = await prisma.rewardHistory.upsert({
        where: {
            customerId_branchId: {
                customerId: customer.id,
                branchId
            }
        },
        update: {}, // Just fetch
        create: {
            customerId: customer.id,
            businessId,
            branchId,
            rewardPoints: 0,
            activeRewards: 0,
            availableRewards: 0
        },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    qrCode: true
                }
            },
            branch: true
        }
    });

    return history;
};

const updatePointsById = async (data) => {
    const { id, points, loggedInUserId, businessId } = data;

    if (!id || points === undefined) {
        throw new AppError(400, "RewardHistory ID and points are required");
    }

    const history = await prisma.rewardHistory.update({
        where: { id },
        data: {
            rewardPoints: { increment: Number(points) },
            lastRewardReceived: new Date()
        }
    });

    // Log transaction
    await auditLog({
        userId: loggedInUserId,
        businessId: businessId || history.businessId,
        action: `Updated reward points for history record ${id} by ${points}`,
        actionType: "UPDATE",
        metadata: {
            historyId: id,
            points
        }
    });

    return history;
};

export const BusinessRewardHistoryService = {
    increaseRewardPoints,
    getRewardHistoryByBranch,
    getHistoryByQrCode,
    updatePointsById
};
