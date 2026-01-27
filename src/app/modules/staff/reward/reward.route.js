import express from "express";
import { checkStaffAuth } from "../../../middleware/staff.middleware.js";
import * as rewardController from "./reward.controller.js";

const router = express.Router();

router.get("/", checkStaffAuth, rewardController.getBranchRewards);

export default router;
