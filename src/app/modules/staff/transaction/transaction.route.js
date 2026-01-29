import express from "express";
import * as transactionController from "./transaction.controller.js";
import { checkStaffAuth } from "../../../middleware/staff.middleware.js";

const router = express.Router();

router.get("/", checkStaffAuth, transactionController.getStaffTransactions);

router.post("/undo", checkStaffAuth, transactionController.requestUndo);

export default router;
