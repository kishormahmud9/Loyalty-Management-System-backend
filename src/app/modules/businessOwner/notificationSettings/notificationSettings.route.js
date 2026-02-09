import express from "express";
import NotificationSettingsController from "./notificationSettings.controller.js";
import { authenticate, authorize, businessScope } from "../../../middleware/auth.middleware.js";
import { PERMISSIONS } from "../../../config/permissions.js";

const router = express.Router();

// Business Owner Settings
router.get(
    "/business-owner",
    authenticate,
    authorize(PERMISSIONS.BUSINESS.READ),
    businessScope,
    NotificationSettingsController.getBusinessOwnerSettings
);

router.post(
    "/business-owner",
    authenticate,
    authorize(PERMISSIONS.BUSINESS.UPDATE),
    businessScope,
    NotificationSettingsController.upsertBusinessOwnerSettings
);

// Branch Settings (Applies to all branches)
router.get(
    "/branch",
    authenticate,
    authorize(PERMISSIONS.BRANCH.READ),
    businessScope,
    NotificationSettingsController.getAllBranchesSettings
);

router.post(
    "/branch",
    authenticate,
    authorize(PERMISSIONS.BRANCH.UPDATE),
    businessScope,
    NotificationSettingsController.upsertAllBranchesSettings
);

export const NotificationSettingsRoutes = router;
