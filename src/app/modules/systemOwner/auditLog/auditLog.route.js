import { Router } from "express";
import {
  getSystemOwnerAuditLogs,
  exportSystemOwnerAuditLogsCSV,
} from "../../systemOwner/auditLog/auditLog.controller.js";

const router = Router();

// System Owner – Audit Logs
router.get("/", getSystemOwnerAuditLogs);

router.get("/export", exportSystemOwnerAuditLogsCSV);

export const AuditLogRoutes = router;
