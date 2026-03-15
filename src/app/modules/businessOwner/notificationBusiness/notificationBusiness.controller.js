import NotificationBusinessService from "./notificationBusiness.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

class NotificationBusinessController {
    /**
     * Get business owner notification history.
     */
    static getNotificationHistory = async (req, res, next) => {
        try {
            const { businessId } = req.user;
            const result = await NotificationBusinessService.getNotificationHistory(businessId);

            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Notifications fetched successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };
}

export default NotificationBusinessController;
