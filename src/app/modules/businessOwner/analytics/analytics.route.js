// src/modules/businessOwner/analytics/analytics.route.js
import express from "express";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { getBusinessOwnerAnalytics } from "./analytics.controller.js";

const router = express.Router();

// GET /api/business-owner/analytics?branchId=
router.get(
  "/",
  checkAuthMiddleware("BUSINESS_OWNER"),
  getBusinessOwnerAnalytics,
);

router.get(
  "/:branchId",
  checkAuthMiddleware("BUSINESS_OWNER"),
  getBusinessOwnerAnalytics,
);

export default router;
