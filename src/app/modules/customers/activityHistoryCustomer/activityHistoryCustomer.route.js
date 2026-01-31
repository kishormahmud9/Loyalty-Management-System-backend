import express from "express";
import { ActivityHistoryCustomerController } from "./activityHistoryCustomer.controller.js";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware.js";

const router = express.Router();

router.post("/my-activity", customerAuthMiddleware, ActivityHistoryCustomerController.getMyActivityHistory);

export const CustomerActivityHistoryRoutes = router;
