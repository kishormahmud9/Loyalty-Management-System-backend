import express from "express";
import { checkStaffAuth } from "../../../middleware/staff.middleware.js";
import { searchCustomer, addPointsInstant } from "./addRedeem.controller.js";

const router = express.Router();

router.post("/search", checkStaffAuth, searchCustomer);

router.post("/add-point", checkStaffAuth, addPointsInstant);

export default router;
