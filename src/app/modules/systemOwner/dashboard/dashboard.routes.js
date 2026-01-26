import { Router } from "express";
import { getSystemOwnerDashboardOverview } from "../../systemOwner/dashboard/dashboard.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

// System Owner Dashboard
router.get(
  "/overview",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  getSystemOwnerDashboardOverview,
);

export const DashboardRoutes = router;
