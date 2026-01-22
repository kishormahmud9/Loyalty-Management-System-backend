import { Router } from "express";
import { createPlan, deletePlan, getAllPlans, reactivatePlan, updatePlan } from "./plan.controller.js";
import { activatePlanForBusiness } from "./plan.controller.js";
const router = Router();

// System Owner – Plan list
router.get("/", getAllPlans);

router.post("/", createPlan);

router.patch("/:planId", updatePlan);

//soft delete plan
router.delete("/:planId", deletePlan);

router.patch("/:planId/activate", reactivatePlan);

router.post("/activate", activatePlanForBusiness);

export const PlanRoutes = router;
