
import { sendResponse } from "../../../utils/sendResponse.js";
import { StaffPermissionService } from "./staffPermission.service.js";

export const StaffPermissionController = {
    handleUpsertPermission: async (req, res, next) => {
        try {
            const { businessId } = req.user;
            const { ...permissionData } = req.body;

            if (!businessId) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "Business ID is missing from your profile",
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
            const { businessId } = req.user;

            if (!businessId) {
                return sendResponse(res, {
                    statusCode: 400,
                    success: false,
                    message: "Business ID is missing from your profile",
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
