import { getSystemOwnerDashboardOverviewService } from "./dashboard.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const getSystemOwnerDashboardOverview = async (req, res) => {
  try {
    const data = await getSystemOwnerDashboardOverviewService();

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "System owner dashboard overview fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Dashboard Controller Error:", error.message);

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to load dashboard data",
      data: null,
    });
  }
};
