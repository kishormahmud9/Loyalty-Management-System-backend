// controllers/staff.controller.js

import { StaffService } from "./manageStaff.service.js"




export const StaffController = {
  create: async (req, res, next) => {
    try {
      const staff = await StaffService.create(
        req.prisma,
        req.body
      )

      res.status(201).json(staff)
    } catch (err) {
      next(err)
    }
  },

  findAll: async (req, res, next) => {
    try {
      const { businessId, branchId, isActive } = req.query

      const staffs = await StaffService.findAll(
        req.prisma,
        {
          businessId,
          branchId,
          isActive: isActive ? isActive === 'true' : undefined,
        }
      )

      res.json(staffs)
    } catch (err) {
      next(err)
    }
  },

  findOne: async (req, res, next) => {
    try {
      const staff = await StaffService.findById(
        req.prisma,
        req.params.id
      )

      res.json(staff)
    } catch (err) {
      next(err)
    }
  },

  update: async (req, res, next) => {
    try {
      const staff = await StaffService.update(
        req.prisma,
        req.params.id,
        req.body
      )

      res.json(staff)
    } catch (err) {
      next(err)
    }
  },

  deactivate: async (req, res, next) => {
    try {
      const staff = await StaffService.deactivate(
        req.prisma,
        req.params.id
      )

      res.json(staff)
    } catch (err) {
      next(err)
    }
  },

  delete: async (req, res, next) => {
    try {
      await StaffService.remove(
        req.prisma,
        req.params.id
      )

      res.status(204).send()
    } catch (err) {
      next(err)
    }
  },
}
