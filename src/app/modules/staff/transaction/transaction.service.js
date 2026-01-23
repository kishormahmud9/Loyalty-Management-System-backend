import prisma from "../../../prisma/client.js";

export const getBranchTransactions = async ({ staff, query }) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const branchId = staff.branchId;

  /**
   * Total transactions (branch-wide)
   */
  const total = await prisma.pointTransaction.count({
    where: { branchId },
  });

  /**
   * Fetch transactions
   */
  const transactions = await prisma.pointTransaction.findMany({
    where: { branchId },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      undoRequests: {
        where: { status: "APPROVED" },
        select: { id: true },
      },
    },
  });

  /**
   * Fetch customer names
   */
  const customerIds = transactions.map((t) => t.customerId).filter(Boolean);

  const customers = await prisma.customer.findMany({
    where: { id: { in: customerIds } },
    select: {
      id: true,
      name: true,
    },
  });

  const customerMap = {};
  customers.forEach((c) => {
    customerMap[c.id] = c.name;
  });

  /**
   * Shape response
   */
  const formatted = transactions.map((tx) => ({
    id: tx.id,
    date: tx.createdAt,
    type: tx.type,
    customerName: tx.customerId
      ? customerMap[tx.customerId] || "Unknown"
      : "Unknown",
    points: tx.points,
    status: tx.undoRequests.length > 0 ? "Voided" : "Completed",
  }));

  return {
    transactions: formatted,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const requestUndo = async ({ staff, params, body }) => {
  const { transactionId } = params;
  const { reason } = body;

  if (!reason || !reason.trim()) {
    throw new Error("Reason is required");
  }

  // 1) Transaction must exist & belong to same branch
  const transaction = await prisma.pointTransaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  if (transaction.branchId !== staff.branchId) {
    throw new Error("You cannot undo transactions from another branch");
  }

  // 2) Prevent duplicate undo requests (PENDING or APPROVED)
  const existing = await prisma.transactionUndoRequest.findFirst({
    where: {
      transactionId,
      status: { in: ["PENDING", "APPROVED"] },
    },
  });

  if (existing) {
    throw new Error("An undo request already exists for this transaction");
  }

  // 3) Create undo request (PENDING)
  const undoRequest = await prisma.transactionUndoRequest.create({
    data: {
      transactionId,
      businessId: staff.businessId,
      branchId: staff.branchId,
      staffId: staff.id,
      reason: reason.trim(),
      status: "PENDING",
    },
  });

  return undoRequest;
};