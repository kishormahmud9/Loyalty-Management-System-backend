// redeemReward.routes.js
import express from "express";
import RedeemRewardController from "./redeemReward.controller.js";
import { authenticate, authorize, businessScope } from "../../../middleware/auth.middleware.js";
import { PERMISSIONS } from "../../../config/permissions.js";
import { upload } from "../../../utils/fileUpload.js";

const router = express.Router();

router.post(
  "/create",
  authenticate,
  authorize(PERMISSIONS.BUSINESS.UPDATE),
  businessScope,
  upload.single("rewardImage"),                   // 2️⃣ multer
  RedeemRewardController.create                  // 3️⃣ controller
);
router.get(
  "/all",
  authenticate,
  authorize(PERMISSIONS.BUSINESS.READ),
  businessScope,
  RedeemRewardController.getAll
);

router.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.BUSINESS.READ),
  businessScope,
  RedeemRewardController.getOne
);

router.get(
  "/business/:businessId",
  authenticate,
  authorize(PERMISSIONS.BUSINESS.READ),
  businessScope,
  RedeemRewardController.getByBusiness
);


router.get(
  "/branch/:branchId",
  authenticate,
  authorize(PERMISSIONS.BUSINESS.READ),
  businessScope,
  RedeemRewardController.getByBranch
);

router.patch(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.BUSINESS.UPDATE),
  businessScope,
  upload.single("rewardImage"),
  RedeemRewardController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.BUSINESS.UPDATE),
  businessScope,
  RedeemRewardController.remove
);

export const RedeemRewardRoutes = router;
