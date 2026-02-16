import { Router } from "express";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware.js";
import { GeoController } from "./geo.controller.js";
import admin from "../../../config/firebase.js";

const router = Router();

// 📍 Geo location check
router.post(
  "/location",
  customerAuthMiddleware,
  GeoController.handleCustomerLocation
);

router.patch(
  "/update-fcm-token",
  customerAuthMiddleware,
  GeoController.updateFcmToken
);

router.get("/test-firebase", async (req, res) => {
  try {
    const response = await admin.messaging().send({
      token: "fake_token_for_testing",
      notification: {
        title: "Test",
        body: "Testing Firebase connection",
      },
    });

    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export const CustomerGeoRoutes = router;
