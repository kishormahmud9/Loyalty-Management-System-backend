// overview.controller.js
import { getOverviewData } from "./overview.service.js";

export const getBusinessOwnerOverview = async (req, res) => {
  try {
    const userId = req.user?.id;

    const data = await getOverviewData(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Overview Controller Error:", err.message);
    return res.status(200).json({
      success: true,
      data: {},
    });
  }
};
