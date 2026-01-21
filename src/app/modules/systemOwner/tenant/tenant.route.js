import { Router } from "express";
import {
  createTenant,
  updateBranchStatus,
  deleteTenant,
  getTenantDetails,
  getTenantList,
  updateTenant,
} from "../../systemOwner/tenant/tenant.controller.js";

const router = Router();

router.get("/", getTenantList);

router.post("/", createTenant);

router.get("/:tenantId", getTenantDetails); // VIEW BUTTON

router.patch("/:tenantId", updateTenant);

router.delete("/:tenantId", deleteTenant); // DELETE TENANT

router.patch("/:tenantId/branches/status", updateBranchStatus);

export default router;
