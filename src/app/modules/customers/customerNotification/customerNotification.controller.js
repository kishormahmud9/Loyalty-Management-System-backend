import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../../utils/sendResponse.js";
import { CustomerNotificationService } from "./customerNotification.service.js";

const updateNotifications = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const result = await CustomerNotificationService.createOrUpdate(customerId, req.body);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Notification settings updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getNotifications = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const result = await CustomerNotificationService.getById(customerId);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Notification settings retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const CustomerNotificationController = {
    updateNotifications,
    getNotifications,
};
