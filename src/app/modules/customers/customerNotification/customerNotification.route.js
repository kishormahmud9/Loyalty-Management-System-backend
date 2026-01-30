import express from "express";
import { CustomerNotificationController } from "./customerNotification.controller.js";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware.js";

const router = express.Router();

router.get("/me", customerAuthMiddleware, CustomerNotificationController.getNotifications);
router.patch("/update", customerAuthMiddleware, CustomerNotificationController.updateNotifications);

export const CustomerNotificationRoutes = router;
