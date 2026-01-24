import * as rewardService from "./reward.service.js";

export const getBranchRewards = async (req, res) => {
  try {
    const data = await rewardService.getBranchRewards(req);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch rewards",
    });
  }
};
