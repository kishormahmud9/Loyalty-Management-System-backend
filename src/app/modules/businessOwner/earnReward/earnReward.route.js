// earnReward.routes.js
import express from "express";
import EarnRewardController from "./earnReward.controller.js";
import { authenticate, authorize, businessScope } from "../../../middleware/auth.middleware.js";
import { enforceSubscription } from "../../../middleware/enforceSubscription.js";
import { PERMISSIONS } from "../../../config/permissions.js";
import { upload } from "../../../utils/fileUpload.js";

const router = express.Router();

router.post(
    "/create",
    authenticate,
    authorize(PERMISSIONS.REWARD.EARN.CREATE),
    businessScope,
    enforceSubscription,
    upload.single("rewardImage"),
    EarnRewardController.create
);

router.get(
    "/all",
    authenticate,
    authorize(PERMISSIONS.BUSINESS.READ),
    businessScope,
    enforceSubscription,
    EarnRewardController.getAll
);

router.get(
    "/:id",
    authenticate,
    authorize(PERMISSIONS.BUSINESS.READ),
    businessScope,
    enforceSubscription,
    EarnRewardController.getOne
);

router.get(
    "/business/:businessId",
    authenticate,
    authorize(PERMISSIONS.BUSINESS.READ),
    businessScope,
    enforceSubscription,
    EarnRewardController.getByBusiness
);
// this is for customer only,,, no auth middleware
router.get(
    "/all/:branchId",
    // authenticate,
    // authorize(PERMISSIONS.BUSINESS.READ),
    // businessScope,
    EarnRewardController.getByBranch
);

router.patch(
    "/:id",
    authenticate,
    authorize(PERMISSIONS.REWARD.EARN.CREATE),
    businessScope,
    enforceSubscription,
    upload.single("rewardImage"),
    EarnRewardController.update
);

router.delete(
    "/:id",
    authenticate,
    authorize(PERMISSIONS.REWARD.EARN.CREATE),
    businessScope,
    enforceSubscription,
    EarnRewardController.remove
);

export const EarnRewardRoutes = router;
