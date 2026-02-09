import express from "express";
import { SubscriptionControllers } from "./subscription.controller.js";

import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = express.Router();

router.post("/create", checkAuthMiddleware(Role.BUSINESS_OWNER), SubscriptionControllers.createSubscription);
router.get("/available-plans", checkAuthMiddleware(Role.BUSINESS_OWNER), SubscriptionControllers.getAllAvailablePlans);
router.get("/my-plans", checkAuthMiddleware(Role.BUSINESS_OWNER), SubscriptionControllers.getMySubscriptions);
router.get("/", checkAuthMiddleware(Role.BUSINESS_OWNER), SubscriptionControllers.getAllSubscription);
router.get("/:id", checkAuthMiddleware(Role.BUSINESS_OWNER), SubscriptionControllers.getSubscriptionById);
router.patch("/:id", checkAuthMiddleware(Role.BUSINESS_OWNER), SubscriptionControllers.updateSubscription);

export const SubscriptionRoutes = router;
