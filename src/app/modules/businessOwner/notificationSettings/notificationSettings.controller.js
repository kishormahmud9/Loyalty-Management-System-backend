import NotificationSettingsService from "./notificationSettings.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

class NotificationSettingsController {
    static async getSettings(req, res) {
        try {
            const { businessId } = req.user;
            const settings = await NotificationSettingsService.getSettings(businessId);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Notification settings retrieved successfully",
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

    static async upsertSettings(req, res) {
        try {
            const { businessId } = req.user;
            const settings = await NotificationSettingsService.upsertSettings(businessId, req.body);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Notification settings upserted successfully",
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
