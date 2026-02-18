import express from "express";
import { deleteNotification, getNotificationHistory, sendNotification } from "./notification.controller.js";
import { checkStaffAuth } from "../../../middleware/staff.middleware.js";

const router = express.Router();

router.post("/", checkStaffAuth, sendNotification);

router.get("/history", checkStaffAuth, getNotificationHistory);

router.delete("/:id", checkStaffAuth, deleteNotification);

export default router;
