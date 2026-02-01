// controllers/staff.controller.js

import { StaffService } from "./manageStaff.service.js"




export const StaffController = {
  create: async (req, res, next) => {
    try {
      const { name, email, password, branchId } = req.body;
      const { businessId } = req.user;
      const staff = await StaffService.create(req.prisma, {
        name,
        email,
        password,
        branchId,
        businessId,
      });

      res.status(201).json({
        success: true,
        message: "Staff created successfully",
        data: staff,
      });
    } catch (err) {
      next(err);
    }
  },

  findAll: async (req, res, next) => {
    try {
      const { branchId } = req.params;
      const { isActive } = req.query;
      const { businessId } = req.user;

      const staffs = await StaffService.findAll(req.prisma, {
        businessId,
        branchId,
        isActive: isActive ? isActive === "true" : undefined,
      });

      res.json({
        success: true,
        message: "Staff retrieved successfully",
        data: staffs,
      });
    } catch (err) {
      next(err);
    }
  },

  getAllStaff: async (req, res, next) => {
    try {
      const { businessId } = req.user;

      const { data, meta } = await StaffService.getAllStaffFromDB(
        req.prisma,
        req.query,
        businessId
      );

      res.json({
        success: true,
        message: "All staff retrieved successfully",
        meta,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  findOne: async (req, res, next) => {
    try {
      const { businessId } = req.user;
      const staff = await StaffService.findById(
        req.prisma,
        req.params.id,
        businessId
      );

      res.json({
        success: true,
        message: "Staff details retrieved",
        data: staff,
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { businessId } = req.user;
      const staff = await StaffService.update(
        req.prisma,
        req.params.id,
        businessId,
        req.body
      );

      res.json({
        success: true,
        message: "Staff updated successfully",
        data: staff,
      });
    } catch (err) {
      next(err);
    }
  },

  deactivate: async (req, res, next) => {
    try {
      const { businessId } = req.user;
      const staff = await StaffService.deactivate(
        req.prisma,
        req.params.id,
        businessId
      );

      res.json({
        success: true,
        message: "Staff deactivated successfully",
        data: staff,
      });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { businessId } = req.user;
      await StaffService.remove(req.prisma, req.params.id, businessId);

      res.status(200).json({
        success: true,
        message: "Staff deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  },
}
