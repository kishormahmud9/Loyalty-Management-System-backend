import { deleteCustomerNotificationService, getCustomerNotificationsService } from "./customer.notification.service.js";

export const getMyNotifications = async (req, res) => {
    try {
        const customerId = req.user.id; // from middleware

        const notifications = await getCustomerNotificationsService(customerId);

        return res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error("Get My Notifications Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const customerId = req.user.id;
        const notificationId = req.params.id;

        await deleteCustomerNotificationService(customerId, notificationId);

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
        });
    } catch (error) {
        console.error("Delete Notification Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to delete notification",
        });
    }
};
