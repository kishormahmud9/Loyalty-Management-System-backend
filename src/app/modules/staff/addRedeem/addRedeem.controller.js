import * as addRedeemService from "./addRedeem.service.js";

export const addPoints = async (req, res) => {
  try {
    const data = await addRedeemService.addPoints(req);

    return res.status(201).json({
      success: true,
      message: "Add points request submitted for approval",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to submit add points request",
    });
  }
};
