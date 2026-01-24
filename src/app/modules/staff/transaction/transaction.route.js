import express from "express";
import * as transactionController from "./transaction.controller.js";
import { resolveStaff } from "../../../middleware/staff.middleware.js";

const router = express.Router();

router.get("/", resolveStaff, transactionController.getStaffTransactions);

router.post(
  "/:adjustmentRequestId/undo",
  resolveStaff,
  transactionController.requestUndo,
);

export default router;
