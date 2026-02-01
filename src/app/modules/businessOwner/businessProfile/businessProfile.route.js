import { Router } from "express";
import { BusinessProfileController } from "./businessProfile.controller.js";
import { authenticate, authorize, businessScope } from "../../../middleware/auth.middleware.js";
import { PERMISSIONS } from "../../../config/permissions.js";
import { upload } from "../../../utils/fileUpload.js";

const router = Router();

// ℹ️ GET Profile
router.get(
    "/",
    authenticate,
    authorize(PERMISSIONS.BUSINESS.READ),
    businessScope,
    BusinessProfileController.getProfile
);

// ℹ️ UPDATE Profile
router.put(
    "/update",
    authenticate,
    authorize(PERMISSIONS.BUSINESS.UPDATE),
    businessScope,
    upload.single("businessLogo"),
    BusinessProfileController.updateProfile
);

export const BusinessProfileRoutes = router;
