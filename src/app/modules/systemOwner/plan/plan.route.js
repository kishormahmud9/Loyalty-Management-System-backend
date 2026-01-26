import { Router } from "express";
import {
  createPlan,
  deactivePlan,
  getAllPlans,
  hardDeletePlan,
  reactivatePlan,
  updatePlan,
} from "./plan.controller.js";
import { activatePlanForBusiness } from "./plan.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
const router = Router();

// System Owner – Plan list
router.get("/", checkAuthMiddleware(Role.SYSTEM_OWNER), getAllPlans);

router.post("/", checkAuthMiddleware(Role.SYSTEM_OWNER), createPlan);

router.patch("/:planId", checkAuthMiddleware(Role.SYSTEM_OWNER), updatePlan);

//soft delete plan
router.patch(
  "/:planId/deactivate",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  deactivePlan,
);

router.patch(
  "/:planId/activate",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  reactivatePlan,
);

router.post(
  "/activate",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  activatePlanForBusiness,
);

router.delete(
  "/:planId/delete",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  hardDeletePlan,
);

export const PlanRoutes = router;
