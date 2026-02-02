import { generateAndSaveQRCode } from "../../../utils/qrGenerator.js";
import { envVars } from "../../../config/env.js";
import { auditLog } from "../../../utils/auditLogger.js";

export const BranchService = {
  async create(prisma, data) {
    const { ownerId, ...branchData } = data;

    try {
      console.log(
        `🚀 [BRANCH_CREATE] Creating new branch: ${branchData.name} for business: ${branchData.businessId}`,
      );

      const result = await prisma.$transaction(async (tx) => {
        // 1. Create the branch record (UNCHANGED)
        const branch = await tx.branch.create({
          data: branchData,
        });

        // 2. Generate QR code content
        const qrData = JSON.stringify({
          businessId: branch.businessId,
          branchId: branch.id,
        });

        // 3. Generate and save QR code image
        const filename = `branch-${branch.id}-${Date.now()}`;
        const qrPath = await generateAndSaveQRCode(
          qrData,
          filename,
          "uploads/branch-qr",
        );

        // 4. Update branch with QR info
        return tx.branch.update({
          where: { id: branch.id },
          data: {
            branchQrCode: qrData,
            branchQrCodeFilePath: qrPath,
            branchQrCodeUrl: `${envVars.SERVER_URL}/${qrPath}`,
          },
        });
      });

      // ✅ AUDIT LOG (AFTER SUCCESSFUL DB OP)
      await auditLog({
        userId: ownerId,
        businessId: result.businessId,
        action: "BRANCH_CREATE",
        actionType: "CREATE",
        metadata: {
          branchId: result.id,
          branchName: result.name,
          managerName: result.managerName,
        },
      });

      console.log(`✅ [BRANCH_CREATE_SUCCESS] Branch created: ${result.id}`);

      return result;
    } catch (error) {
      console.error(
        `🔥 [BRANCH_CREATE_ERROR] Failed for ${branchData.name}:`,
        error.message,
      );
      throw error;
    }
  },

  findAll(prisma, businessId) {
    return prisma.branch.findMany({
      where: { businessId },
    });
  },

  findMyBranchesMinimal(prisma, businessId) {
    return prisma.branch.findMany({
      where: { businessId },
      select: {
        id: true,
        name: true,
      },
    });
  },

  findById(prisma, id) {
    return prisma.branch.findUnique({
      where: { id },
    });
  },

  async update(prisma, id, data) {
    const { ownerId, businessId, ...updateData } = data;

    // 1. Update branch (teammate logic preserved)
    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: updateData,
    });

    // 2. Audit log (AFTER DB success)
    await auditLog({
      userId: ownerId,
      businessId,
      action: "BRANCH_UPDATE",
      actionType: "UPDATE",
      metadata: {
        branchId: updatedBranch.id,
        branchName: updatedBranch.name,
        updatedFields: Object.keys(updateData),
      },
    });

    return updatedBranch;
  },

  async remove(prisma, id, data) {
    const { ownerId, businessId } = data;

    try {
      console.log(`🚀 [BRANCH_DELETE] removing branch: ${id}`);

      // 1. Fetch branch BEFORE delete (for audit metadata)
      const branch = await prisma.branch.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
        },
      });

      // 2. Delete branch (teammate logic)
      const result = await prisma.branch.delete({
        where: { id },
      });

      console.log(`✅ [BRANCH_DELETE_SUCCESS] removed: ${id}`);

      // 3. Audit log AFTER success
      await auditLog({
        userId: ownerId,
        businessId,
        action: "BRANCH_DELETE",
        actionType: "DELETE",
        metadata: {
          branchId: branch?.id,
          branchName: branch?.name,
        },
      });

      return result;
    } catch (error) {
      console.error(
        `🔥 [BRANCH_DELETE_ERROR] Failed to remove ${id}:`,
        error.message,
      );
      throw error;
    }
  },
};
