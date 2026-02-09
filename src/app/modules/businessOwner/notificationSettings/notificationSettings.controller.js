import NotificationSettingsService from "./notificationSettings.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

class NotificationSettingsController {
    static async getBusinessOwnerSettings(req, res) {
        try {
            const { businessId } = req.user;
            const settings = await NotificationSettingsService.getBusinessOwnerSettings(businessId);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Business owner notification settings retrieved successfully",
                data: settings,
            });
        } catch (error) {
            sendResponse(res, {
                statusCode: 500,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }

    static async upsertBusinessOwnerSettings(req, res) {
        try {
            const { businessId } = req.user;
            const settings = await NotificationSettingsService.upsertBusinessOwnerSettings(businessId, req.body);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Business owner notification settings updated successfully",
                data: settings,
            });
        } catch (error) {
            sendResponse(res, {
                statusCode: 400,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }

    static async getAllBranchesSettings(req, res) {
        try {
            const { businessId } = req.user;
            const settings = await NotificationSettingsService.getAllBranchesSettings(businessId);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "All branch notification settings retrieved successfully",
                data: settings,
            });
        } catch (error) {
            sendResponse(res, {
                statusCode: 500,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }

    static async upsertAllBranchesSettings(req, res) {
        try {
            const { businessId } = req.user;
            const settings = await NotificationSettingsService.upsertAllBranchesSettings(businessId, req.body);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Notification settings applied to all branches successfully",
                data: settings,
            });
        } catch (error) {
            sendResponse(res, {
                statusCode: 400,
                success: false,
                message: error.message,
                data: null,
            });
        }
    }
}

export default NotificationSettingsController;
