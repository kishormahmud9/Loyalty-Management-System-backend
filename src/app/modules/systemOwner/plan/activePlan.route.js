import { Router } from "express";
import { getActivePlanForBusiness } from "./activePlan.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get(
  "/:businessId",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  getActivePlanForBusiness,
);

export const ActivePlanRoutes = router;
