// redeemReward.routes.js
import express from "express";
import RedeemRewardController from "./redeemReward.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import { upload } from "../../../utils/fileUpload.js";

const router = express.Router();

router.post(
  "/create",
  checkAuthMiddleware(Role.BUSINESS_OWNER), // 1️⃣ auth FIRST
  upload.single("rewardImage"),                   // 2️⃣ multer
  RedeemRewardController.create                  // 3️⃣ controller
);
router.get(
  "/all",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  RedeemRewardController.getAll
);

router.get(
  "/:id",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  RedeemRewardController.getOne
);

router.get(
  "/business/:businessId",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  RedeemRewardController.getByBusiness
);

router.get(
  "/branch/:branchId",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  RedeemRewardController.getByBranch
);

router.patch(
  "/:id",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  upload.single("rewardImage"),
  RedeemRewardController.update
);

router.delete(
  "/:id",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  RedeemRewardController.remove
);

export const RedeemRewardRoutes = router;
