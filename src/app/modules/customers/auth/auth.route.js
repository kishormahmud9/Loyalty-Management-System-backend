import express from "express";
import { AuthController } from "./auth.controller.js";

import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware.js";

const router = express.Router();

router.post("/login", AuthController.credentialLogin);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.logout);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/verify-forgot-password-otp", AuthController.verifyForgotPasswordOtp);
router.post(
  "/reset-password",
  customerAuthMiddleware,
  AuthController.resetPassword
);


export const CustomerAuthRouter = router;
