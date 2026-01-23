import * as staffService from "./customer.service.js";

// Get branch customers for staff

export const getBranchCustomers = async (req, res) => {
  try {
    const data = await staffService.getBranchCustomers(req);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch customers",
    });
  }
};

// Get customer stats (total + monthly visits)

export const getCustomerStats = async (req, res) => {
  try {
    const data = await staffService.getCustomerStats(req);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch customer stats",
    });
  }
};
