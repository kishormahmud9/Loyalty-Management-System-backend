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

    // 3. Verify or Auto-Register customer at this branch
    let registration = await prisma.customerBranchData.findFirst({
        where: {
            customerId,
            branchId,
            businessId
        }
    });

    // 4. Update or create reward history (using transaction for atomicity and auto-registration)
    try {
        console.log(`🚀 [POINTS_UPDATE] Increasing points for Customer: ${customerId} | Branch: ${branchId} | Points: ${points}`);

        const result = await prisma.$transaction(async (tx) => {
            // If not registered, create registration record
            if (!registration) {
                console.log(`📝 [AUTO_REG] Registering customer ${customerId} to branch ${branchId}`);
                await tx.customerBranchData.create({
                    data: {
                        customerId,
                        businessId,
                        branchId
                    }
                });
            }

            // Define how we find the record (prioritize ID if it came from the search results)
            const whereClause = (rewardHistoryId && rewardHistoryId !== "null")
                ? { id: rewardHistoryId }
                : { customerId_branchId: { customerId, branchId } };

            const history = await tx.rewardHistory.upsert({
                where: whereClause,
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

            // 5. Create PointTransaction log so it appears in Customer History
            await tx.pointTransaction.create({
                data: {
                    businessId,
                    branchId,
                    customerId,
                    points: Number(points),
                    type: "EARN",
                    staffId: staffProfile ? staffProfile.id : null // If staff performed it, link them
                }
            });

            return history;
        });

        console.log(`✅ [POINTS_UPDATE] Successfully updated points for ${customerId}. New Total: ${result.rewardPoints}`);

        // Log for system audit
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

        return result;

    } catch (error) {
        console.error(`🔥 [POINTS_UPDATE_ERROR] Failed to update points for ${customerId} at branch ${branchId}:`, error);
        throw error;
    }
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
                // If branchId is provided, we can find businessId from it
                if (branchId) {
                    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
                    if (branch) businessId = branch.businessId;
                }
                if (!businessId) {
                    throw new AppError(400, "businessId is required (multiple businesses found)");
                }
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
                throw new AppError(400, "Branch does not belong to chosen business or does not exist");
            }
        }
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

    try {
        console.log(`🚀 [POINTS_MANUAL_UPDATE] Updating history record ${id} with ${points} points.`);

        const result = await prisma.$transaction(async (tx) => {
            const history = await tx.rewardHistory.update({
                where: { id },
                data: {
                    rewardPoints: { increment: Number(points) },
                    lastRewardReceived: new Date()
                }
            });

            // Create PointTransaction log
            await tx.pointTransaction.create({
                data: {
                    businessId: businessId || history.businessId,
                    branchId: history.branchId,
                    customerId: history.customerId,
                    points: Number(points),
                    type: "EARN"
                }
            });

            return history;
        });

        console.log(`✅ [POINTS_MANUAL_UPDATE] Successfully updated record ${id}.`);

        // Log transaction
        await auditLog({
            userId: loggedInUserId,
            businessId: businessId || result.businessId,
            action: `Updated reward points for history record ${id} by ${points}`,
            actionType: "UPDATE",
            metadata: {
                historyId: id,
                points
            }
        });

        return result;

    } catch (error) {
        console.error(`🔥 [POINTS_MANUAL_UPDATE_ERROR] Failed to update history record ${id}:`, error);
        throw error;
    }
};

const findCustomerByQr = async (data) => {
    const { qrCode, loggedInUserId } = data;

    if (!qrCode) {
        throw new AppError(400, "qrCode is required");
    }

    // 1. Find customer
    const customer = await prisma.customer.findUnique({
        where: { qrCode },
        select: {
            id: true,
            name: true,
            email: true,
            qrCode: true
        }
    });

    if (!customer) {
        throw new AppError(404, "Customer not found");
    }

    const customerId = customer.id;

    // 2. Find all businesses owned by this user
    const businesses = await prisma.business.findMany({
        where: { ownerId: loggedInUserId },
        select: { id: true, name: true }
    });

    const businessIds = businesses.map(b => b.id);

    // 3. Find all branches for these businesses
    const allBranches = await prisma.branch.findMany({
        where: { businessId: { in: businessIds } },
        select: {
            id: true,
            name: true,
            businessId: true,
            business: {
                select: {
                    name: true
                }
            }
        }
    });

    // 4. Find all reward history for this customer in these businesses
    const rewardHistories = await prisma.rewardHistory.findMany({
        where: {
            customerId: customerId,
            businessId: { in: businessIds }
        }
    });

    // 5. Merge branches with history into RewardHistory model structure
    const rewardHistoriesResult = allBranches.map(branch => {
        const history = rewardHistories.find(h => h.branchId === branch.id);

        return {
            id: history ? history.id : null,
            rewardPoints: history ? history.rewardPoints : 0,
            activeRewards: history ? history.activeRewards : 0,
            availableRewards: history ? history.availableRewards : 0,
            lastRewardReceived: history ? history.lastRewardReceived : null,
            customerId: customerId,
            businessId: branch.businessId,
            branchId: branch.id,
            branch: {
                id: branch.id,
                name: branch.name
            },
            business: {
                id: branch.businessId,
                name: branch.business ? branch.business.name : null
            }
        };
    });

    return {
        customer,
        rewardHistories: rewardHistoriesResult
    };
};

export const BusinessRewardHistoryService = {
    increaseRewardPoints,
    getRewardHistoryByBranch,
    getHistoryByQrCode,
    updatePointsById,
    findCustomerByQr
};
