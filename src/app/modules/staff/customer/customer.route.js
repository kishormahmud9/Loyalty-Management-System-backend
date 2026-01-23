import express from "express";
import * as staffController from "./customer.controller.js";
import { resolveStaff } from "../../../middleware/staff.middleware.js";

const router = express.Router();

router.get("/", resolveStaff, staffController.getBranchCustomers);

router.get("/stats", resolveStaff, staffController.getCustomerStats);

export default router;
