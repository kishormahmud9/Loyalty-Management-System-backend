// controllers/branch.controller.js

import { sendResponse } from "../../../utils/sendResponse.js";
import { BranchService } from "./branchs.service.js";

export const BranchController = {
  create: async (req, res, next) => {
    try {
      const { businessId, id: ownerId } = req.user; // 🔥 ADD ownerId

      const business = await req.prisma.business.findUnique({
        where: { id: businessId },
        select: { name: true },
      });

      let branchImageFilePath = null;
      let branchImageUrl = null;

      if (req.file) {
        branchImageFilePath = req.file.path.replace(/\\/g, "/");
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        branchImageUrl = `${baseUrl}/${branchImageFilePath}`;
      }

      const branchData = {
        businessId,
        ownerId, // 🔥 PASS TO SERVICE
        businessName: business?.name || null,
        managerName: req.body.managerName || null,
        name: req.body.branchName,
        address: req.body.branchLocation,
        city: req.body.city,
        country: req.body.country,
        staffCount: req.body.staffCount ? parseInt(req.body.staffCount) : 0,
        branchImageUrl,
        branchImageFilePath,
      };

      const branch = await BranchService.create(req.prisma, branchData);

      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Branch created successfully",
        data: branch,
      });
    } catch (err) {
      next(err);
    }
  },

  findAll: async (req, res, next) => {
    try {
      const { businessId } = req.user;

      const branches = await BranchService.findAll(req.prisma, businessId);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "All branches retrieved successfully",
        data: branches,
      });
    } catch (err) {
      next(err);
    }
  },

  getMyBranches: async (req, res, next) => {
    try {
      const { businessId } = req.user;

      const branches = await BranchService.findMyBranchesMinimal(
        req.prisma,
        businessId,
      );
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Your branches retrieved successfully",
        data: branches,
      });
    } catch (err) {
      next(err);
    }
  },

  findOne: async (req, res, next) => {
    try {
      const branch = await BranchService.findById(req.prisma, req.params.id);

      if (!branch) {
        return sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "Branch not found",
          data: null,
        });
      }

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Branch retrieved successfully",
        data: branch,
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id: ownerId, businessId } = req.user;

      // 🖼️ IMAGE HANDLING
      let branchImageFilePath = undefined;
      let branchImageUrl = undefined;

      if (req.file) {
        branchImageFilePath = req.file.path.replace(/\\/g, "/");
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        branchImageUrl = `${baseUrl}/${branchImageFilePath}`;
      }

      const branch = await BranchService.update(req.prisma, req.params.id, {
        ...req.body,
        branchImageUrl,
        branchImageFilePath,
        ownerId, // 🔥 audit only
        businessId, // 🔥 audit only
      });

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Branch updated successfully",
        data: branch,
      });
    } catch (err) {
      next(err);
    }
  },

  updateLocation: async (req, res, next) => {
    try {
      const { id: ownerId, businessId } = req.user;
      const { latitude, longitude } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return sendResponse(res, {
          statusCode: 400,
          success: false,
          message: "latitude and longitude are required",
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        return sendResponse(res, {
          statusCode: 400,
          success: false,
          message: "latitude and longitude must be valid numbers",
        });
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return sendResponse(res, {
          statusCode: 400,
          success: false,
          message: "Invalid coordinates. lat must be -90 to 90, lng must be -180 to 180",
        });
      }

      const branch = await BranchService.updateGeoLocation(
        req.prisma,
        req.params.id,
        businessId,
        lat,
        lng,
      );

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Branch location updated successfully. Geo-fencing is now active for this branch.",
        data: {
          id: branch.id,
          name: branch.name,
          latitude: branch.latitude,
          longitude: branch.longitude,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id: ownerId, businessId } = req.user;

      await BranchService.remove(req.prisma, req.params.id, {
        ownerId,
        businessId,
      });

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Branch deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  },
};
