import * as redeemService from "./addRedeem.service.js";

export const searchCustomer = async (req, res) => {
  try {
    const data = await redeemService.searchCustomerService(req);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: error.message || "Failed to search customer",
    });
  }
};

export const addPointsInstant = async (req, res) => {
  try {
    const data = await redeemService.addPointsInstantService(req);

    return res.status(200).json({
      success: true,
      message: "Points added successfully",
      data,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: error.message || "Failed to add points",
    });
  }
};
