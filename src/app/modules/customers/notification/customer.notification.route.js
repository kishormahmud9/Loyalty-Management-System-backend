import express from "express";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware.js";
import { deleteNotification, getMyNotifications } from "./customer.notification.controller.js";

const router = express.Router();

router.get("/", customerAuthMiddleware, getMyNotifications);
router.delete("/:id", customerAuthMiddleware, deleteNotification);

export const CustomerGetNotificationRoutes = router;
