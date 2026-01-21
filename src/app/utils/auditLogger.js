import prisma from "../prisma/client.js";

export const auditLog = async ({
  userId,
  businessId = null,
  action,
  actionType = "OTHER",
  metadata = null,
}) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        businessId,
        action,
        actionType,
        metadata,
      },
    });
  } catch (error) {
    // ❌ DO NOT THROW
    console.error("Audit Log Failed:", error.message);
  }
};
