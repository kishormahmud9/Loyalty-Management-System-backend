import express from "express";
import {
  createCheckout,
  handleStripeWebhook,
} from "../payment/payment.controller.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";

const router = express.Router();

// Business Owner → Stripe Checkout

router.post("/checkout", checkAuthMiddleware("BUSINESS_OWNER"), createCheckout);

// Stripe Webhook (NO AUTH)

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

export default router;
