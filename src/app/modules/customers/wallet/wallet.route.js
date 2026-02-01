import express from "express";
import { CustomerWalletController } from "./wallet.controller.js";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware.js";

const router = express.Router();

router.get(
    "/google-wallet-link/:cardId",
    customerAuthMiddleware,
    CustomerWalletController.getGoogleWalletLink
);

export const CustomerWalletRoutes = router;
