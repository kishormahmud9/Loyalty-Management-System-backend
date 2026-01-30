import express from "express";
import { getStaffSettings } from "./settings.controller.js";
import { checkStaffAuth } from "../../../middleware/staff.middleware.js";

const router = express.Router();

router.get("/", checkStaffAuth, getStaffSettings);

export default router;
