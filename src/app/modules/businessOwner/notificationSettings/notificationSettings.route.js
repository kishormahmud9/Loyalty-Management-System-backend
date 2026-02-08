import express from "express";
import NotificationSettingsController from "./notificationSettings.controller.js";
import { userAuthMiddleware } from "../../../middleware/userAuthMiddleware.js";

const router = express.Router();

// Get settings
router.get(
    "/",
    userAuthMiddleware,
    NotificationSettingsController.getSettings
);

// Unified Upsert (General + Branch settings)
router.post(
    "/",
    userAuthMiddleware,
    NotificationSettingsController.upsertSettings
);

export const NotificationSettingsRoutes = router;
