// services/staff.service.js
import bcrypt from "bcrypt";
import { envVars } from "../../../config/env.js";
import { QueryBuilder } from "../../../utils/QueryBuilder.js";
import { auditLog } from "../../../utils/auditLogger.js";

export const StaffService = {
  async create(prisma, data) {
    const { name, email, password, branchId, businessId } = data;

    try {
      console.log(
        `🚀 [MANAGE_STAFF] Creating new staff for branch: ${branchId} | Email: ${email}`,
      );

      // 1. Hash the password
      const hashedPassword = await bcrypt.hash(
        password,
        Number(envVars.BCRYPT_SALT_ROUND),
      );

      // 2. Execute in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create User
        const user = await tx.user.create({
          data: {
            name,
            email,
            passwordHash: hashedPassword,
            role: "STAFF",
            isVerified: true, // Staff users are verified by default
          },
        });

        // Create Staff linked to User and Business/Branch
        const staff = await tx.staff.create({
          data: {
            userId: user.id,
            businessId,
            branchId,
            role: "STAFF", // Default to STAFF role
            isActive: true,
          },
          include: {
            user: true,
            business: true,
            branch: true,
          },
        });

        return staff;
      });

      console.log(
        `✅ [MANAGE_STAFF] Staff created successfully: ${result.id} (User: ${result.userId})`,
      );

      await auditLog({
        userId: data.ownerId, // business owner
        businessId,
        action: "STAFF_CREATE",
        actionType: "CREATE",
        metadata: {
          staffId: result.id,
          staffName: result.user?.name,
          staffEmail: result.user?.email,
          staffRole: result.role,
          branchId: result.branchId,
          branchName: result.branch?.name,
        },
      });

      console.log("AUDIT LOG DEBUG:", {
        ownerId: data.ownerId,
        businessId,
      });

      return result;
    } catch (error) {
      console.error(
        `🔥 [MANAGE_STAFF_ERROR] Failed to create staff for email ${email}:`,
        error.message,
      );
      throw error;
    }
  },

  findAll(prisma, filters = {}) {
    return prisma.staff.findMany({
      where: filters,
      include: {
        user: true,
        business: true,
        branch: true,
      },
    });
  },

  async getAllStaffFromDB(prisma, query, businessId) {
    const staffModel = new QueryBuilder(query)
      .search(["user.name", "user.email"])
      .filter({
        branch: ["name"], // This allows filtering by branch name if passed as { name: '...' } in where
      })
      .sort()
      .paginate()
      .fields();

    const result = await prisma.staff.findMany({
      where: {
        ...staffModel.where,
        businessId,
      },
      ...staffModel.build(),
      include: {
        user: true,
        business: true,
        branch: true,
      },
    });

    const total = await prisma.staff.count({
      where: {
        ...staffModel.where,
        businessId,
      },
    });

    return {
      data: result,
      meta: staffModel.getMeta(total),
    };
  },

  findById(prisma, id, businessId) {
    return prisma.staff.findFirst({
      where: { id, businessId },
      include: {
        user: true,
        business: true,
        branch: true,
      },
    });
  },

  async update(prisma, id, businessId, data) {
    const { name, email, branchId, role, isActive } = data;

    const updatedStaff = await prisma.$transaction(async (tx) => {
      const staff = await tx.staff.findFirst({
        where: { id, businessId },
      });

      if (!staff) {
        const error = new Error("Staff not found or access denied");
        error.statusCode = 404;
        throw error;
      }

      if (name || email) {
        await tx.user.update({
          where: { id: staff.userId },
          data: {
            ...(name && { name }),
            ...(email && { email }),
          },
        });
      }

      const updatedStaff = await tx.staff.update({
        where: { id },
        data: {
          ...(branchId && { branchId }),
          ...(role && { role }),
          ...(isActive !== undefined && { isActive }),
        },
        include: {
          user: true,
          business: true,
          branch: true,
        },
      });

      return updatedStaff;
    });

    // ✅ NOW audit log is POSSIBLE
    await auditLog({
      userId: data.ownerId,
      businessId,
      action: "STAFF_UPDATE",
      actionType: "UPDATE",
      metadata: {
        staffId: updatedStaff.id,
        staffName: updatedStaff.user?.name,
        updatedFields: Object.keys(data),
        staffRole: updatedStaff.role,
        branchId: updatedStaff.branchId,
        branchName: updatedStaff.branch?.name,
        isActive: updatedStaff.isActive,
      },
    });

    return updatedStaff;
  },

  deactivate(prisma, id, businessId) {
    return prisma.staff.updateMany({
      where: { id, businessId },
      data: { isActive: false },
    });
  },

  async remove(prisma, id, businessId, ownerId) {
    const staff = await prisma.$transaction(async (tx) => {
      // 1. Find staff and check ownership
      const staff = await tx.staff.findFirst({
        where: { id, businessId },
        include: {
          user: true,
          branch: true,
        },
      });

      if (!staff) {
        const error = new Error("Staff not found or access denied");
        error.statusCode = 404;
        throw error;
      }

      // 2. Delete Staff record
      await tx.staff.delete({
        where: { id },
      });

      // 3. Delete associated User record
      await tx.user.delete({
        where: { id: staff.userId },
      });

      return staff; // 👈 return for audit log
    });

    // ✅ AUDIT LOG (OUTSIDE TRANSACTION)
    await auditLog({
      userId: ownerId,
      businessId,
      action: "STAFF_DELETE",
      actionType: "DELETE",
      metadata: {
        staffId: staff.id,
        staffName: staff.user?.name,
        staffEmail: staff.user?.email,
        staffRole: staff.role,
        branchId: staff.branchId,
        branchName: staff.branch?.name,
      },
    });

    return { success: true };
  },
};
