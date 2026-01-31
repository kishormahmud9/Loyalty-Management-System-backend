import express from "express";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { getBusinessOwnerOverview } from "../overview/overview.controller.js";

const router = express.Router();

router.get("/", checkAuthMiddleware("BUSINESS_OWNER"), getBusinessOwnerOverview);

export default router;
