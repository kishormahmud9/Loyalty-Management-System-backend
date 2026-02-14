import {
    getGeoSettingService,
    updateGeoSettingService,
    getAllBranchesWithLocationService,
    updateBranchLocationService
} from "./geo.service.js";


export const getGeoSetting = async (req, res, next) => {
    try {
        const setting = await getGeoSettingService();

        res.status(200).json({
            success: true,
            message: "Geo setting fetched successfully",
            data: setting,
        });
    } catch (error) {
        next(error);
    }
};


export const updateGeoSetting = async (req, res, next) => {
    try {
        const { isEnabled, radiusMeters, cooldownHours } = req.body;

        const updatedSetting = await updateGeoSettingService({
            isEnabled,
            radiusMeters,
            cooldownHours,
        });

        res.status(200).json({
            success: true,
            message: "Geo setting updated successfully",
            data: updatedSetting,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllBranchesWithLocation = async (req, res, next) => {
    try {
        const branches = await getAllBranchesWithLocationService();

        res.status(200).json({
            success: true,
            message: "Branches with location fetched successfully",
            data: branches,
        });
    } catch (error) {
        next(error);
    }
};

export const updateBranchLocation = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "latitude and longitude are required",
      });
    }

    const updatedBranch = await updateBranchLocationService(
      branchId,
      latitude,
      longitude
    );

    res.status(200).json({
      success: true,
      message: "Branch location updated successfully",
      data: updatedBranch,
    });
  } catch (error) {
    next(error);
  }
};
