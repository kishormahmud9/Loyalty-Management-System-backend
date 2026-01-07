import express from "express";
import { AuthController } from "./auth.controller.js";

const router = express.Router();
router.post("/login", AuthController.loginUser);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.logout);



export const AuthRouter = router;
