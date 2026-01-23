import express from "express";
import * as transactionController from "./transaction.controller.js";
import { resolveStaff } from "../../../middleware/staff.middleware.js";

const router = express.Router();

router.get(
  "/",
  resolveStaff,
  transactionController.getBranchTransactions,
);

router.post(
  "/:transactionId/undo",
  resolveStaff,
  transactionController.requestUndo,
);

export default router;
