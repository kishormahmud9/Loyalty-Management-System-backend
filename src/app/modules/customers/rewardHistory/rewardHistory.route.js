import express from "express";
import { CustomerRewardHistoryController } from "./rewardHistory.controller.js";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware.js";

const router = express.Router();

router.get(
    "/my-history",
    customerAuthMiddleware,
    CustomerRewardHistoryController.getMyHistory
);

router.get(
    "/branch",
    customerAuthMiddleware,
    CustomerRewardHistoryController.getMyBranchHistory
);

router.get(
    "/branch/:branchId",
    customerAuthMiddleware,
    CustomerRewardHistoryController.getMyBranchHistory
);

export const CustomerRewardHistoryRoutes = router;
