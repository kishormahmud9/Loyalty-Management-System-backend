// controllers/branch.controller.js

import { sendResponse } from "../../../utils/sendResponse.js";
import { BranchService } from "./branchs.service.js";

export const BranchController = {
  create: async (req, res, next) => {
    try {
      const { businessId } = req.user;

      // Fetch business name from Business table
      const business = await req.prisma.business.findUnique({
        where: { id: businessId },
        select: { name: true },
      });

      // Map field names from request to match Branch model schema
      const branchData = {
        businessId: businessId, // 🔒 Force businessId from authenticated user
        businessName: business?.name || null,
        managerName: req.body.managerName || null,
        name: req.body.branchName, // Map branchName -> name
        address: req.body.branchLocation, // Map branchLocation -> address
        city: req.body.city,
        country: req.body.country,
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

      const branches = await BranchService.findMyBranchesMinimal(req.prisma, businessId);
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
      const branch = await BranchService.update(req.prisma, req.params.id, req.body);

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

  delete: async (req, res, next) => {
    try {
      await BranchService.remove(req.prisma, req.params.id);

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Branch deleted successfully",
        data: null,
      });
    } catch (err) {
      next(err);
    }
  },
};
