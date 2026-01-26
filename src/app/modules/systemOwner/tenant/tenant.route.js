import { Router } from "express";
import {
  createTenant,
  updateBranchStatus,
  deleteTenant,
  getTenantDetails,
  getTenantList,
  updateTenant,
} from "../../systemOwner/tenant/tenant.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get("/", checkAuthMiddleware(Role.SYSTEM_OWNER), getTenantList);

router.post("/", checkAuthMiddleware(Role.SYSTEM_OWNER), createTenant);

router.get(
  "/:tenantId",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  getTenantDetails,
); // VIEW BUTTON

router.patch(
  "/:tenantId",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  updateTenant,
);

router.delete(
  "/:tenantId",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  deleteTenant,
); // DELETE TENANT

router.patch(
  "/:tenantId/branches/status",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  updateBranchStatus,
);

export default router;
