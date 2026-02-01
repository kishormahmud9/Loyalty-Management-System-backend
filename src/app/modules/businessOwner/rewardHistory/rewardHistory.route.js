import express from "express";
import { BusinessRewardHistoryController } from "./rewardHistory.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = express.Router();

router.post(
    "/increase-points/:branchId",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    BusinessRewardHistoryController.increasePoints
);

router.get(
    "/customer/:customerId/branch/:branchId",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    BusinessRewardHistoryController.getCustomerBranchHistory
);

router.get(
    "/scan-qr",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    BusinessRewardHistoryController.scanByQr
);

router.patch(
    "/update-points/:id",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    BusinessRewardHistoryController.updatePoints
);

router.get(
    "/find-customer/:qrCode",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    BusinessRewardHistoryController.findCustomerByQr
);

export const BusinessRewardHistoryRoutes = router;
