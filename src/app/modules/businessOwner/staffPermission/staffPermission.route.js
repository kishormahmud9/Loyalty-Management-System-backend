
import { Router } from "express";
import { StaffPermissionController } from "./staffPermission.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.post(
    "/manage",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    StaffPermissionController.handleUpsertPermission
);

router.get(
    "/manage",
    checkAuthMiddleware(Role.BUSINESS_OWNER),
    StaffPermissionController.handleGetPermission
);

export const StaffPermissionRoutes = router;
