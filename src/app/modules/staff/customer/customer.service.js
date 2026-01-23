import prisma from "../../../prisma/client.js";

/**
 * Get branch customers (list page)
 */
export const getBranchCustomers = async ({ staff, query }) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const branchId = staff.branchId;

  // 1️⃣ total customers (branch-wise)
  const total = await prisma.customerBranchData.count({
    where: { branchId },
  });

  // 2️⃣ fetch customer-branch links
  const customerLinks = await prisma.customerBranchData.findMany({
    where: { branchId },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // 3️⃣ fetch reward history for branch customers
  const customerIds = customerLinks.map((c) => c.customerId);

  const rewardHistories = await prisma.rewardHistory.findMany({
    where: {
      branchId,
      customerId: { in: customerIds },
    },
  });

  const rewardMap = {};
  rewardHistories.forEach((r) => {
    rewardMap[r.customerId] = r;
  });

  // 4️⃣ shape response
  const customers = customerLinks.map((item) => {
    const reward = rewardMap[item.customerId];

    return {
      id: item.customer.id,
      name: item.customer.name,
      email: item.customer.email,
      rewardPoints: reward?.availableRewards || 0,
      lastVisit: reward?.lastRewardReceived || null,
    };
  });

  return {
    customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get customer stats (top summary)
 */
export const getCustomerStats = async ({ staff }) => {
  const branchId = staff.branchId;

  // total customers
  const totalCustomers = await prisma.customerBranchData.count({
    where: { branchId },
  });

  // monthly visits (based on reward activity)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyVisits = await prisma.rewardHistory.count({
    where: {
      branchId,
      lastRewardReceived: {
        gte: startOfMonth,
      },
    },
  });

  return {
    totalCustomers,
    monthlyVisits,
  };
};
