import prisma from "../../../prisma/client.js";

export const getStaffTransactions = async ({ staff, query }) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  /* ===============================
     COMPLETED (from PointTransaction)
  =============================== */
  const completedTransactions = await prisma.pointTransaction.findMany({
    where: { branchId: staff.branchId },
    orderBy: { createdAt: "desc" },
  });

  const customerIds = completedTransactions
    .map((t) => t.customerId)
    .filter(Boolean);

  const customers = await prisma.customer.findMany({
    where: { id: { in: customerIds } },
    select: { id: true, name: true },
  });

  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c.name]));

  const completed = completedTransactions.map((tx) => ({
    id: tx.id,
    date: tx.createdAt,
    type: tx.type,
    customerName: customerMap[tx.customerId] || "Unknown",
    points: tx.points,
    status: "COMPLETED",
    canUndo: false,
  }));

  /* ===============================
     PENDING / REJECTED (Adjustments)
  =============================== */
  const usedAdjustmentIds = completedTransactions
    .map((t) => t.adjustmentRequestId)
    .filter(Boolean);

  const adjustments = await prisma.pointAdjustmentRequest.findMany({
    where: {
      branchId: staff.branchId,
      status: { in: ["PENDING", "REJECTED"] },
      NOT: { id: { in: usedAdjustmentIds } },
    },
    include: {
      customer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingAndRejected = adjustments.map((req) => ({
    id: req.id,
    date: req.createdAt,
    type: req.type,
    customerName: req.customer.name,
    points: req.points,
    status: req.status,
    canUndo: req.status === "PENDING",
  }));

  /* ===============================
     MERGE + PAGINATION
  =============================== */
  const all = [...pendingAndRejected, ...completed]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(skip, skip + limit);

  return {
    transactions: all,
    pagination: {
      page,
      limit,
      total: pendingAndRejected.length + completed.length,
      totalPages: Math.ceil(
        (pendingAndRejected.length + completed.length) / limit,
      ),
    },
  };
};

export const requestUndo = async ({ staff, params, body }) => {
  const { adjustmentRequestId } = params;
  const { reason } = body;

  if (!reason?.trim()) {
    throw new Error("Undo reason is required");
  }

  /* 1️⃣ Adjustment must exist */
  const adjustment = await prisma.pointAdjustmentRequest.findUnique({
    where: { id: adjustmentRequestId },
  });

  if (!adjustment) {
    throw new Error("Request not found");
  }

  /* 2️⃣ Branch safety */
  if (adjustment.branchId !== staff.branchId) {
    throw new Error("Unauthorized request");
  }

  /* 3️⃣ Only PENDING allowed */
  if (adjustment.status !== "PENDING") {
    throw new Error("Only pending requests can be undone");
  }

  /* 4️⃣ Only one undo per adjustment */
  const existingUndo = await prisma.transactionUndoRequest.findFirst({
    where: { adjustmentRequestId },
  });

  if (existingUndo) {
    throw new Error("Undo already requested");
  }

  /* 5️⃣ Only one undo per customer per staff */
  const staffCustomerUndo = await prisma.transactionUndoRequest.findFirst({
    where: {
      staffId: staff.id,
      customerId: adjustment.customerId,
    },
  });

  if (staffCustomerUndo) {
    throw new Error("You already used undo for this customer");
  }

  /* 6️⃣ Create undo request */
  return prisma.transactionUndoRequest.create({
    data: {
      adjustmentRequestId,
      customerId: adjustment.customerId,
      businessId: staff.businessId,
      branchId: staff.branchId,
      staffId: staff.id,
      reason: reason.trim(),
      status: "PENDING",
    },
  });
};
