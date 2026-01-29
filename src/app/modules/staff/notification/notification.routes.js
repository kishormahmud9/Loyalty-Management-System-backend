import express from "express";
import { getNotificationHistory, sendNotification } from "./notification.controller.js";
import { checkStaffAuth } from "../../../middleware/staff.middleware.js";

const router = express.Router();

router.post("/", checkStaffAuth, sendNotification);

router.get("/history", checkStaffAuth, getNotificationHistory);

export default router;
