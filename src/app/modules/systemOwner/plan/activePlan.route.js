import { Router } from "express";
import { getActivePlanForBusiness } from "./activePlan.controller.js";

const router = Router();

router.get("/:businessId", getActivePlanForBusiness);

export const ActivePlanRoutes = router;
