// earnReward.routes.js
import express from "express";
import EarnRewardController from "./earnReward.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import { upload } from "../../../utils/fileUpload.js";

const router = express.Router();

router.post(
    "/create",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    upload.single("rewardImage"),
    EarnRewardController.create
);

router.get(
    "/all",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    EarnRewardController.getAll
);

router.get(
    "/:id",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    EarnRewardController.getOne
);

router.get(
    "/business/:businessId",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    EarnRewardController.getByBusiness
);

router.get(
    "/branch/:branchId",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    EarnRewardController.getByBranch
);

router.patch(
    "/:id",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    upload.single("rewardImage"),
    EarnRewardController.update
);

router.delete(
    "/:id",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    EarnRewardController.remove
);

export const EarnRewardRoutes = router;
