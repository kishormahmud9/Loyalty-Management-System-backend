import express from "express";
import { AuthController } from "./auth.controller.js";
import passport from "passport";
import { envVars } from "../../config/env.js";
import { Role } from "../../utils/role.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";

const router = express.Router();
router.post("/login", AuthController.credentialLogin);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.logout);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/verify-forgot-password-otp", AuthController.verifyForgotPasswordOtp);
router.post(
  "/reset-password",
  checkAuthMiddleware(...Object.values(Role)),
  AuthController.resetPassword
);
// Google login
router.get("/google", (req, res, next) => {
  let redirect = req.query.redirect || "/";

  if (typeof redirect === "string" && redirect.startsWith("/")) {
    redirect = redirect.slice(1);
  }

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirect,
    session: false,
  })(req, res, next);
});

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${envVars.FRONT_END_URL}/login?error=Google login failed&isError=true`,
  }),
  AuthController.googleCallback
);

export const AuthRouter = router;
