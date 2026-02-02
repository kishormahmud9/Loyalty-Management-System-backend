import express from "express";
import { forgotPin, resetPin, setStaffPin, staffLogin, staffPinLogin, verifyForgotPinOtp } from "./staff.auth.controller.js";
import { checkStaffTempAuth } from "../../../middleware/staff.middleware.js";

const router = express.Router();

router.post("/login", staffLogin);

router.post("/set-pin", checkStaffTempAuth, setStaffPin);

router.post("/pin-login", staffPinLogin);

router.post("/forgot-pin", forgotPin);

router.post("/verify-forgot-pin-otp", verifyForgotPinOtp);

router.post("/reset-pin", resetPin);


export default router;
