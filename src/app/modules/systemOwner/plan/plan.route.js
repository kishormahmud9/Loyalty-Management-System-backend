import { Router } from "express";
import { createPlan, getAllPlans } from "./plan.controller.js";
import { activatePlanForBusiness } from "./plan.controller.js";
const router = Router();

// System Owner – Plan list
router.get("/", getAllPlans);

router.post("/", createPlan);

router.post("/activate", activatePlanForBusiness);

export const PlanRoutes = router;
