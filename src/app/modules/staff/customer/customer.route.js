import express from "express";
import * as staffController from "./customer.controller.js";
import { checkStaffAuth } from "../../../middleware/staff.middleware.js";

const router = express.Router();

router.use(checkStaffAuth);

router.get("/", staffController.getBranchCustomers);
router.get("/stats", staffController.getCustomerStats);

export default router;
