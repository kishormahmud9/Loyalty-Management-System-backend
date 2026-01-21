import {
  getSystemOwnerAuditLogsService,
  exportSystemOwnerAuditLogsCSVService,
} from "../../systemOwner/auditLog/auditLog.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

export const getSystemOwnerAuditLogs = async (req, res) => {
  try {
    const data = await getSystemOwnerAuditLogsService(req.query);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Audit logs fetched successfully",
      data,
    });
  } catch (error) {
    console.error("AuditLog Controller Error:", error.message);

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch audit logs",
      data: null,
    });
  }
};

export const exportSystemOwnerAuditLogsCSV = async (req, res) => {
  try {
    const csvData = await exportSystemOwnerAuditLogsCSVService(req.query);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=audit_logs.csv");

    return res.status(200).send(csvData);
  } catch (error) {
    console.error("AuditLog CSV Export Error:", error.message);

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to export audit logs",
      data: null,
    });
  }
};
