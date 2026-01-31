import express from "express";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware.js";
import { EarnRewardCustomerController } from "./earnRewardCustomer.controller.js";

const router = express.Router();

router.get("/my-earn-rewards", customerAuthMiddleware, EarnRewardCustomerController.getMyEarnRewards);

export const EarnRewardCustomerRoutes = router;
