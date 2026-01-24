import express from "express";
import { resolveStaff } from "../../../middleware/staff.middleware.js";
import * as addRedeemController from "./addRedeem.controller.js";

const router = express.Router();

router.post("/add", resolveStaff, addRedeemController.addPoints);

export default router;
