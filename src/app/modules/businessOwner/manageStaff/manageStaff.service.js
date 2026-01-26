// services/staff.service.js
import bcrypt from "bcrypt";
import { envVars } from "../../../config/env.js";

export const StaffService = {
  async create(prisma, data) {
    const { name, email, password, branchId, businessId } = data;

    // 1. Hash the password
    const hashedPassword = await bcrypt.hash(
      password,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    // 2. Execute in transaction
    return await prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          role: 'STAFF',
        },
      });

      // Create Staff linked to User and Business/Branch
      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          businessId,
          branchId,
          role: 'STAFF', // Default to STAFF role
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
  },

  findAll(prisma, filters = {}) {
    return prisma.staff.findMany({
      where: filters,
      include: {
        user: true,
        business: true,
        branch: true,
      },
    })
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

    return await prisma.$transaction(async (tx) => {
      // 1. Find staff and check ownership
      const staff = await tx.staff.findFirst({
        where: { id, businessId },
      });

      if (!staff) {
        const error = new Error("Staff not found or access denied");
        error.statusCode = 404;
        throw error;
      }

      // 2. Update User details if provided
      if (name || email) {
        await tx.user.update({
          where: { id: staff.userId },
          data: {
            ...(name && { name }),
            ...(email && { email }),
          },
        });
      }

      // 3. Update Staff details if provided
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
  },

  deactivate(prisma, id, businessId) {
    return prisma.staff.updateMany({
      where: { id, businessId },
      data: { isActive: false },
    });
  },

  remove(prisma, id, businessId) {
    return prisma.staff.deleteMany({
      where: { id, businessId },
    });
  },
}
