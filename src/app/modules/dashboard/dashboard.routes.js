import { Router } from "express";
import { getSystemOwnerDashboardOverview } from "./dashboard.controller.js";

const router = Router();

// System Owner Dashboard
router.get("/overview", getSystemOwnerDashboardOverview);

export const DashboardRoutes = router;
