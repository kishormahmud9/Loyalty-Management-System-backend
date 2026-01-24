import express from "express";
import { resolveStaff } from "../../../middleware/staff.middleware.js";
import * as rewardController from "./reward.controller.js";

const router = express.Router();

router.get("/", resolveStaff, rewardController.getBranchRewards);

export default router;
