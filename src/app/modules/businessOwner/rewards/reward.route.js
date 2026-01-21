// reward.routes.js
import express from "express";
import RewardController from "./reward.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import { upload } from "../../../utils/fileUpload.js";

const router = express.Router();

router.post(
  "/create",
  checkAuthMiddleware(Role.BUSINESS_OWNER), // 1️⃣ auth FIRST
  upload.single("rewardImage"),                   // 2️⃣ multer
  RewardController.create                  // 3️⃣ controller
);
router.get(
  "/all",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  RewardController.getAll
);

router.get(
  "/:id",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  RewardController.getOne
);

router.get(
  "/business/:businessId",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  RewardController.getByBusiness
);

router.get(
  "/branch/:branchId",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  RewardController.getByBranch
);

router.patch(
  "/:id",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  upload.single("rewardImage"),
  RewardController.update
);

router.delete(
  "/:id",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  RewardController.remove
);

export const RewardRoutes = router;
