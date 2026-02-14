import prisma from "../../../prisma/client.js";

export const getStaffTransactions = async ({ staff, query }) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  /* 
     FETCH TRANSACTIONS
   */
  const [transactions, total] = await Promise.all([
    prisma.pointTransaction.findMany({
      where: {
        businessId: staff.businessId,
        branchId: staff.branchId,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.pointTransaction.count({
      where: {
        businessId: staff.businessId,
        branchId: staff.branchId,
      },
    }),
  ]);

  if (!transactions.length) {
    return {
      transactions: [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /* 
     LOAD RELATED DATA
   */
  const customerIds = transactions.map((t) => t.customerId).filter(Boolean);

  const transactionIds = transactions.map((t) => t.id);

  const [customers, undoRequests] = await Promise.all([
    prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, name: true },
    }),
    prisma.transactionUndoRequest.findMany({
      where: {
        adjustmentRequestId: { in: transactionIds },
      },
      select: {
        adjustmentRequestId: true,
        status: true,
      },
    }),
  ]);

  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c.name]));

  const undoMap = Object.fromEntries(
    undoRequests.map((u) => [u.adjustmentRequestId, u.status]),
  );

  /* 
     FORMAT RESPONSE
   */
  const formatted = transactions.map((tx) => {
    const undoStatus = undoMap[tx.id];

    return {
      id: tx.id,
      date: tx.createdAt,
      type: tx.type,
      customerName: customerMap[tx.customerId] || "Unknown",
      points: tx.points,
      status: undoStatus === "PENDING" ? "PENDING" : "COMPLETED",
      canUndo: !undoStatus, // no undo request exists
    };
  });

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

export const requestUndo = async ({ staff, body }) => {
  const { transactionId, reason } = body;

  /* 
     VALIDATION
   */
  if (!transactionId) {
    throw new Error("Transaction ID is required");
  }

  if (!reason || reason.trim().length < 5) {
    throw new Error("Undo reason is required");
  }

  /* 
     FETCH TRANSACTION
   */
  const transaction = await prisma.pointTransaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  /* 
     AUTHORIZATION
   */
  if (transaction.branchId !== staff.branchId) {
    throw new Error("You are not allowed to undo this transaction");
  }

  /* 
     CHECK EXISTING UNDO
   */
  const existingUndo = await prisma.transactionUndoRequest.findFirst({
    where: {
      adjustmentRequestId: transaction.id,
    },
  });

  if (existingUndo) {
    throw new Error("Undo already requested for this transaction");
  }

  /* 
     CREATE UNDO REQUEST
   */
  await prisma.transactionUndoRequest.create({
    data: {
      adjustmentRequestId: transaction.id, // link to transaction
      reason,
      customerId: transaction.customerId,
      businessId: staff.businessId,
      branchId: staff.branchId,
      staffId: staff.id,
      status: "PENDING",
    },
  });

  return {
    transactionId: transaction.id,
    status: "PENDING",
  };
};
