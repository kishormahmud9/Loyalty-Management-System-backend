import { handleCustomerLocationService, updateFcmTokenService } from "./geo.service.js";

export const GeoController = {
    handleCustomerLocation: async (req, res, next) => {
        try {
            const { latitude, longitude } = req.body;
            const customerId = req.user.id;

            if (!latitude || !longitude) {
                return res.status(400).json({
                    success: false,
                    message: "latitude and longitude are required",
                });
            }

            const result = await handleCustomerLocationService(
                customerId,
                latitude,
                longitude
            );

            res.status(200).json({
                success: true,
                message: "Location processed successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },

    updateFcmToken: async (req, res, next) => {
        try {
            const customerId = req.user.id;
            const { fcmToken } = req.body;

            if (!fcmToken) {
                return res.status(400).json({
                    success: false,
                    message: "fcmToken is required",
                });
            }

            await updateFcmTokenService(customerId, fcmToken);

            res.status(200).json({
                success: true,
                message: "FCM token updated successfully",
            });
        } catch (error) {
            next(error);
        }
    },
};

