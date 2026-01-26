import {
  createTenantService,
  updateBranchStatusService,
  deleteTenantService,
  getTenantDetailsService,
  getTenantListService,
  updateTenantService,
} from "../../systemOwner/tenant/tenant.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";

export const getTenantList = async (req, res) => {
  try {
    // 🔐 SYSTEM OWNER ONLY
    if (req.user.role !== "SYSTEM_OWNER") {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Access denied",
        data: null,
      });
    }

    const result = await getTenantListService(req.prisma, req.query);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Tenant list fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.error("GET TENANT LIST ERROR:", error);

    return sendResponse(res, {
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message || "Failed to fetch tenant list",
      data: null,
    });
  }
};

export const createTenant = async (req, res) => {
  try {
    const result = await createTenantService(req.prisma, req.body);

    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Tenant created successfully",
      data: {
        businessId: result.business.id,
        ownerEmail: result.owner.email,
        trialEndsAt: result.business.trialEndsAt,
      },
    });
  } catch (error) {
    console.error("CREATE TENANT ERROR:", error);

    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message || "Failed to create tenant",
      data: null,
    });
  }
};

export const getTenantDetails = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const data = await getTenantDetailsService(req.prisma, tenantId);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Tenant details fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET TENANT DETAILS ERROR:", error);

    return sendResponse(res, {
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message || "Failed to fetch tenant details",
      data: null,
    });
  }
};

export const updateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    await updateTenantService(req.prisma, tenantId, req.body);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Tenant updated successfully",
      data: null,
    });
  } catch (error) {
    console.error("UPDATE TENANT ERROR:", error);

    return sendResponse(res, {
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message || "Failed to update tenant",
      data: null,
    });
  }
};

export const deleteTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    await deleteTenantService(req.prisma, tenantId);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Tenant and all related branches deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("DELETE TENANT ERROR:", error);

    return sendResponse(res, {
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message || "Failed to delete tenant",
      data: null,
    });
  }
};

export const updateBranchStatus = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { action, count } = req.body;

    const result = await updateBranchStatusService(
      req.prisma,
      tenantId,
      action,
      Number(count),
    );

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Branch(es) ${action}d successfully`,
      data: result,
    });
  } catch (error) {
    console.error("UPDATE BRANCH STATUS ERROR:", error);

    return sendResponse(res, {
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message || "Failed to update branch status",
      data: null,
    });
  }
};
