import express from "express";
import * as staffController from "./customer.controller.js";
import {
  authenticate,
  authorize,
  branchScope,
  resolveStaffFromToken,
} from "../../../middleware/auth.middleware.js";
import { Role } from "../../../utils/role.js";

const router = express.Router();

router.use(
  authenticate, // 1. Verify the JWT token
  authorize(Role.STAFF), // 2. Ensure the user is a STAFF member
  branchScope, // 3. Ensure they can ONLY hit their own branch
  resolveStaffFromToken, // 4. Extract staff details into req.staff
);

router.get("/", staffController.getBranchCustomers);

router.get("/stats", staffController.getCustomerStats);

export default router;
