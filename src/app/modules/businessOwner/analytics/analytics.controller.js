// src/modules/businessOwner/analytics/analytics.controller.js
import { getAnalyticsData } from "./analytics.service.js";

export const getBusinessOwnerAnalytics = async (req, res) => {
  try {
    const userId = req.user?.id;
    // Check both params (for /analytics/:branchId) and query (for /analytics?branchId=)
    const branchId = req.params.branchId || req.query.branchId;

    const data = await getAnalyticsData(userId, branchId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Analytics Controller Error:", err.message);

    return res.status(200).json({
      success: true,
      data: {
        stats: {},
        table: [],
      },
    });
  }
};
