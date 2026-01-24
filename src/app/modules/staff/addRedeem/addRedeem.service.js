import prisma from "../../../prisma/client.js";

export const addPoints = async ({ staff, body }) => {
  const { customerId, points, reason } = body;

  if (!customerId) {
    throw new Error("customerId is required");
  }

  if (!points || points <= 0) {
    throw new Error("points must be greater than 0");
  }

  /**
   * 1️⃣ Ensure customer belongs to staff branch
   */
  const customerBranch = await prisma.customerBranchData.findUnique({
    where: {
      customerId_branchId: {
        customerId,
        branchId: staff.branchId,
      },
    },
  });

  if (!customerBranch) {
    throw new Error("Customer does not belong to your branch");
  }

  const pendingRequest = await prisma.pointAdjustmentRequest.findFirst({
    where: {
      staffId: staff.id,
      customerId,
      status: "PENDING",
    },
  });

  if (pendingRequest) {
    throw new Error("You already have a pending request for this customer");
  }

  const request = await prisma.pointAdjustmentRequest.create({
    data: {
      type: "ADD",
      points,
      reason: reason?.trim(),
      customerId,
      staffId: staff.id,
      businessId: staff.businessId,
      branchId: staff.branchId,
      status: "PENDING",
    },
  });

  return request;
};
