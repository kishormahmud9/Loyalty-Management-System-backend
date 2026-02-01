import { generateAndSaveQRCode } from "../../../utils/qrGenerator.js";
import { envVars } from "../../../config/env.js";

export const BranchService = {
  async create(prisma, data) {
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
      const filename = `branch-${branch.id}-${Date.now()}`;
      const qrPath = await generateAndSaveQRCode(qrData, filename, "uploads/branch-qr");

      // 4. Update the branch record with QR info
      return await tx.branch.update({
        where: { id: branch.id },
        data: {
          branchQrCode: qrData,
          branchQrCodeFilePath: qrPath,
          branchQrCodeUrl: `${envVars.SERVER_URL}/${qrPath}`,
        },
      });
    });
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

  remove(prisma, id) {
    return prisma.branch.delete({
      where: { id },
    })
  },
}
