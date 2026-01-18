import {
  createTenantService,
  updateBranchStatusService,
  deleteTenantService,
  getTenantDetailsService,
  getTenantListService,
  updateTenantService,
} from "./tenant.service.js";

export const getTenantList = async (req, res) => {
  try {
    // 🔐 SYSTEM OWNER ONLY
    // if (req.user.role !== "SYSTEM_OWNER") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Access denied",
    //   });
    // }

    const result = await getTenantListService(req.prisma, req.query);

    return res.status(200).json({
      success: true,
      message: "Tenant list fetched successfully",
      ...result,
    });
  } catch (error) {
    console.error("GET TENANT LIST ERROR:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch tenant list",
    });
  }
};

export const createTenant = async (req, res) => {
  try {
    const result = await createTenantService(req.prisma, req.body);

    return res.status(201).json({
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

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create tenant",
    });
  }
};

export const getTenantDetails = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const data = await getTenantDetailsService(req.prisma, tenantId);

    return res.status(200).json({
      success: true,
      message: "Tenant details fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET TENANT DETAILS ERROR:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch tenant details",
    });
  }
};

export const updateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    await updateTenantService(req.prisma, tenantId, req.body);

    return res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
    });
  } catch (error) {
    console.error("UPDATE TENANT ERROR:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update tenant",
    });
  }
};

export const deleteTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    await deleteTenantService(req.prisma, tenantId);

    return res.status(200).json({
      success: true,
      message: "Tenant and all related branches deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TENANT ERROR:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete tenant",
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

    return res.status(200).json({
      success: true,
      message: `Branch(es) ${action}d successfully`,
      data: result,
    });
  } catch (error) {
    console.error("UPDATE BRANCH STATUS ERROR:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update branch status",
    });
  }
};
