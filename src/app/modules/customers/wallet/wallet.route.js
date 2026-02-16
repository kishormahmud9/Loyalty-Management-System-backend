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
    "/apple-wallet-link/:cardId",
    customerAuthMiddleware,
    CustomerWalletController.getAppleWalletLink
);

router.get(
    "/apple-wallet-pass/:customerId/:cardId",
    CustomerWalletController.addAppleWallet
);

router.post(
    "/save-card/:cardId",
    customerAuthMiddleware,
    CustomerWalletController.saveCard
);

router.get(
    "/history",
    customerAuthMiddleware,
    CustomerWalletController.getWalletHistory
);

router.get(
    "/my-wallets/:businessId",
    customerAuthMiddleware,
    CustomerWalletController.getMyWallets
);

export const CustomerWalletRoutes = router;
