// routes/branch.routes.js

import { Router } from "express";
import { BranchController } from "./branchs.controller.js";
import {
  authenticate,
  authorize,
  businessScope,
} from "../../../middleware/auth.middleware.js";
import { enforceSubscription } from "../../../middleware/enforceSubscription.js";
import { PERMISSIONS } from "../../../config/permissions.js";

import { upload } from "../../../utils/fileUpload.js";

const router = Router();

router.post(
  "/create",
  authenticate,
  authorize(PERMISSIONS.BRANCH.CREATE),
  businessScope,
  enforceSubscription,
  upload.single("branchImage"),
  BranchController.create,
);
router.get(
  "/all",
  authenticate,
  authorize(PERMISSIONS.BRANCH.READ),
  businessScope,
  enforceSubscription,
  BranchController.findAll,
);
router.get(
  "/my-branches",
  authenticate,
  authorize(PERMISSIONS.BRANCH.READ),
  businessScope,
  enforceSubscription,
  BranchController.getMyBranches,
);
router.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.BRANCH.READ),
  businessScope,
  enforceSubscription,
  BranchController.findOne,
);
router.put(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.BRANCH.UPDATE),
  businessScope,
  enforceSubscription,
  upload.single("branchImage"),
  BranchController.update,
);
router.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.BRANCH.DELETE),
  businessScope,
  enforceSubscription,
  BranchController.delete,
);

export const BranchRoute = router;
