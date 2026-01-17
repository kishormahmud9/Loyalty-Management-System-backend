import express from "express";
import { UserController } from "./user.controller.js";
import { Role } from "../../utils/role.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";

const router = express.Router();

router.post("/register", UserController.registerUser);
router.get("/profile/me", checkAuthMiddleware(...Object.values(Role)), UserController.getUserInfo);

// router.get("/profile", checkAuthMiddleware(...Object.values(Role)) , UserController.getUserProfile);

router.get("/user-details/:id", checkAuthMiddleware(...Object.values(Role)), UserController.userDetails);

router.get("/all", UserController.getAllUsersWithProfile);

router.post("/update-user", checkAuthMiddleware(...Object.values(Role)), UserController.updateUser);

export const UserRoutes = router;
