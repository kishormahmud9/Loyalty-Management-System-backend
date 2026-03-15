import express from "express";
import { PERMISSIONS } from "../../../config/permissions.js";
import { authenticate, authorize, businessScope } from "../../../middleware/auth.middleware.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import NotificationBusinessController from "./notificationBusiness.controller.js";

const router = express.Router();

router.get(
    "/history",
    authenticate,
    authorize(PERMISSIONS.BUSINESS.READ),
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    businessScope,
    NotificationBusinessController.getNotificationHistory
);

export const NotificationBusinessRoutes = router;
