import { Router } from "express";
import { getSystemOwnerDashboardOverview } from "../../systemOwner/dashboard/dashboard.controller.js";

const router = Router();

// System Owner Dashboard
router.get("/overview", getSystemOwnerDashboardOverview);

export const DashboardRoutes = router;
