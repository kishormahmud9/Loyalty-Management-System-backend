import * as notificationService from "./notification.service.js";

export const sendNotification = async (req, res) => {
  try {
    const data = await notificationService.sendNotification(req);

    return res.status(200).json({
      success: true,
      message: "Notification sent successfully",
      data,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: error.message || "Failed to send notification",
    });
  }
};

export const getNotificationHistory = async (req, res) => {
  try {
    const data = await notificationService.getNotificationHistory(req);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: "Failed to load notification history",
      data: [],
    });
  }
};
