import { Router } from "express";
import {
  getSystemOwnerAuditLogs,
  exportSystemOwnerAuditLogsCSV,
} from "../../systemOwner/auditLog/auditLog.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

// System Owner – Audit Logs
router.get(
  "/",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  getSystemOwnerAuditLogs,
);

router.get(
  "/export",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  exportSystemOwnerAuditLogsCSV,
);

export const AuditLogRoutes = router;
