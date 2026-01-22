
import express from "express";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware.js";
import { CustomerRewardController } from "./rewards.controller.js";

const router = express.Router();

router.get(
    "/branch-rewards",
    customerAuthMiddleware,
    CustomerRewardController.getBranchRewards
);

export const CustomerRewardRoutes = router;
