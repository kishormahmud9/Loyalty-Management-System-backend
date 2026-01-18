import { getSystemOwnerDashboardOverviewService } from "./dashboard.service.js";

export const getSystemOwnerDashboardOverview = async (req, res) => {
  try {
    const data = await getSystemOwnerDashboardOverviewService();

    return res.status(200).json({
      success: true,
      message: "System owner dashboard overview fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Dashboard Controller Error:", error.message);

    return res.status(200).json({
      success: false,
      message: "Failed to load dashboard data",
      data: null,
    });
  }
};
