import express from "express";
import { TransactionHistoryCustomerController } from "./transactionHistoryCustomer.controller.js";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware.js";

const router = express.Router();

router.get("/earned-history", customerAuthMiddleware, TransactionHistoryCustomerController.getEarnedHistory);

export const CustomerTransactionHistoryRoutes = router;
