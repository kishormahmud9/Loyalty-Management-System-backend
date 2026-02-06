import express from "express";
import { CustomerWalletController } from "./wallet.controller.js";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware.js";

const router = express.Router();

router.get(
    "/google-wallet-link/:cardId",
    customerAuthMiddleware,
    CustomerWalletController.getGoogleWalletLink
);

router.get(
    "/apple-wallet-pass/:cardId",
    customerAuthMiddleware,
    CustomerWalletController.addAppleWallet
);

router.get(
    "/history",
    customerAuthMiddleware,
    CustomerWalletController.getWalletHistory
);

export const CustomerWalletRoutes = router;
