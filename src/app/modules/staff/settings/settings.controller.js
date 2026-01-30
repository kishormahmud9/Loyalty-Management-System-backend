import * as settingsService from "./settings.service.js";

export const getStaffSettings = async (req, res) => {
  try {
    const data = await settingsService.getStaffSettings(req);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: error.message || "Failed to load settings",
      data: null,
    });
  }
};
