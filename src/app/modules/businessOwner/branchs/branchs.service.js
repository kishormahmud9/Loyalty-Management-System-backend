import { generateAndSaveQRCode } from "../../../utils/qrGenerator.js";
import { envVars } from "../../../config/env.js";

export const BranchService = {
  async create(prisma, data) {
    try {
      console.log(`🚀 [BRANCH_CREATE] Creating new branch: ${data.name} for business: ${data.businessId}`);

      return await prisma.$transaction(async (tx) => {
        // 1. Create the branch record
        const branch = await tx.branch.create({
          data,
        });

        // 2. Generate QR code content (businessId and branchId)
        const qrData = JSON.stringify({
          businessId: branch.businessId,
          branchId: branch.id,
        });

        // 3. Generate and save QR code image
        console.log(`ℹ️ [BRANCH_CREATE] Generating QR code for branch: ${branch.id}`);
        const filename = `branch-${branch.id}-${Date.now()}`;
        const qrPath = await generateAndSaveQRCode(qrData, filename, "uploads/branch-qr");

        // 4. Update the branch record with QR info
        const result = await tx.branch.update({
          where: { id: branch.id },
          data: {
            branchQrCode: qrData,
            branchQrCodeFilePath: qrPath,
            branchQrCodeUrl: `${envVars.SERVER_URL}/${qrPath}`,
          },
        });

        console.log(`✅ [BRANCH_CREATE_SUCCESS] Branch created: ${result.id} | QR URL: ${result.branchQrCodeUrl}`);
        return result;
      });

    } catch (error) {
      console.error(`🔥 [BRANCH_CREATE_ERROR] Failed for ${data.name}:`, error.message);
      throw error;
    }
  },

  findAll(prisma, businessId) {
    return prisma.branch.findMany({
      where: { businessId },
    })
  },

  findMyBranchesMinimal(prisma, businessId) {
    return prisma.branch.findMany({
      where: { businessId },
      select: {
        id: true,
        name: true,
      },
    })
  },

  findById(prisma, id) {
    return prisma.branch.findUnique({
      where: { id },
    })
  },

  update(prisma, id, data) {
    return prisma.branch.update({
      where: { id },
      data,
    })
  },

  async remove(prisma, id) {
    try {
      console.log(`🚀 [BRANCH_DELETE] removing branch: ${id}`);
      const result = await prisma.branch.delete({
        where: { id },
      });
      console.log(`✅ [BRANCH_DELETE_SUCCESS] removed: ${id}`);
      return result;
    } catch (error) {
      console.error(`🔥 [BRANCH_DELETE_ERROR] Failed to remove ${id}:`, error.message);
      throw error;
    }
  },
}
