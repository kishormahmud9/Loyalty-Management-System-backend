
import { sendResponse } from "../../../utils/sendResponse.js";
import { StaffPermissionService } from "./staffPermission.service.js";

export const StaffPermissionController = {
    handleUpsertPermission: async (req, res, next) => {
        try {
            const { businessId, ...permissionData } = req.body;
            const ownerId = req.user.id;

            if (!businessId) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "businessId is required",
                    data: null,
                });
            }

            const business = await req.prisma.business.findUnique({
                where: { id: businessId },
                select: { ownerId: true },
            });

            if (!business) {
                return sendResponse(res, {
                    statusCode: 404,
                    success: false,
                    message: "Business not found",
                    data: null,
                });
            }

            if (business.ownerId !== ownerId) {
                console.log(`[StaffPermission] Upsert - Ownership mismatch. business.ownerId: ${business.ownerId}, req.user.id: ${ownerId}`);
                return sendResponse(res, {
                    statusCode: 403,
                    success: false,
                    message: "Forbidden: You do not own this business",
                    data: null,
                });
            }

            const result = await StaffPermissionService.upsertPermission(
                req.prisma,
                businessId,
                permissionData
            );

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Staff permissions updated successfully",
                data: result,
            });
        } catch (err) {
            next(err);
        }
    },

    handleGetPermission: async (req, res, next) => {
        try {
            const { businessId } = req.params;
            const ownerId = req.user.id;

            if (!businessId) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "businessId is required",
                    data: null,
                });
            }

            const business = await req.prisma.business.findUnique({
                where: { id: businessId },
                select: { ownerId: true },
            });

            if (!business) {
                return sendResponse(res, {
                    statusCode: 404,
                    success: false,
                    message: "Business not found",
                    data: null,
                });
            }

            if (business.ownerId !== ownerId) {
                console.log(`[StaffPermission] Get - Ownership mismatch. business.ownerId: ${business.ownerId}, req.user.id: ${ownerId}`);
                console.log(`[StaffPermission] Requested businessId: ${businessId}`);
                return sendResponse(res, {
                    statusCode: 403,
                    success: false,
                    message: "Forbidden: You do not own this business",
                    data: null,
                });
            }

            const result = await StaffPermissionService.getPermissionByBusinessId(
                req.prisma,
                businessId
            );

            if (!result) {
                return sendResponse(res, {
                    statusCode: 404,
                    success: false,
                    message: "Permissions not found for this business",
                    data: null,
                });
            }

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Staff permissions retrieved successfully",
                data: result,
            });
        } catch (err) {
            next(err);
        }
    },
};
