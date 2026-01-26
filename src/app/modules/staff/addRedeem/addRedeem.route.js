import express from "express";
import { PERMISSIONS } from "../../../config/permissions.js";
import { authenticate, authorize, branchScope, businessScope, resolveStaffFromToken } from "../../../middleware/auth.middleware.js";
import * as addRedeemController from "./addRedeem.controller.js";

const router = express.Router();

router.post("/add", authenticate, authorize(PERMISSIONS.REWARD.EARN.CREATE), businessScope, branchScope, resolveStaffFromToken, addRedeemController.addPoints);

export default router;
