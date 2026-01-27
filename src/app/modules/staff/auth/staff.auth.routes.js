import express from "express";
import { setStaffPin, staffLogin, staffPinLogin } from "./staff.auth.controller.js";
import { checkStaffTempAuth } from "../../../middleware/staff.middleware.js";

const router = express.Router();

router.post("/login", staffLogin);

router.post("/set-pin", checkStaffTempAuth, setStaffPin);

router.post("/pin-login", staffPinLogin);


export default router;
