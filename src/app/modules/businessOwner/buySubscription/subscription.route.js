import express from "express";
import { SubscriptionControllers } from "./subscription.controller.js";

const router = express.Router();

router.post("/create", SubscriptionControllers.createSubscription);
router.get("/", SubscriptionControllers.getAllSubscription);
router.get("/:id", SubscriptionControllers.getSubscriptionById);
router.patch("/:id", SubscriptionControllers.updateSubscription);

export const SubscriptionRoutes = router;
