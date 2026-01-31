import prisma from "../../../prisma/client.js";

/* ---------------- SAFE QUERY WRAPPER ---------------- */
const safe = async (fn, fallback) => {
  try {
    return await fn();
  } catch (err) {
    console.error("Analytics Service Error:", err.message);
    return fallback;
  }
};

export const getAnalyticsData = async (userId, branchId) => {
  /* ---------- RESOLVE BUSINESS ---------- */
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
    select: { id: true },
  });

  if (!business) {
    return {
      stats: {},
      table: [],
    };
  }

  const businessId = business.id;

  /* ---------- TOP STATS ---------- */

  const totalCustomers = await safe(
    () =>
      prisma.customerBranchData.count({
        where: {
          businessId,
          ...(branchId && { branchId }),
        },
      }),
    0,
  );

  const rewardRedeemed = await safe(
    () =>
      prisma.claimReward.count({
        where: {
          redeemReward: { businessId },
          claimStatus: "CLAIMED",
          ...(branchId && { branchId }),
        },
      }),
    0,
  );

  const totalVisitsThisMonth = await safe(
    () =>
      prisma.pointTransaction.count({
        where: {
          businessId,
          type: "EARN",
          ...(branchId && { branchId }),
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    0,
  );

  /* ---------- TABLE DATA (DAILY AGGREGATION) ---------- */

  const table = await safe(async () => {
    const conditions = [prisma.sql`"businessId" = ${businessId}`];

    if (branchId) {
      conditions.push(prisma.sql`"branchId" = ${branchId}`);
    }

    const rows = await prisma.$queryRaw`
        SELECT
          DATE("createdAt")                     AS date,
          COUNT(*)::int                         AS transactions,
          SUM(CASE WHEN "type" = 'REDEEM'
              THEN 1 ELSE 0 END)::int           AS rewardRedeemed,
          SUM("points")::int                    AS programCost
        FROM "PointTransaction"
        WHERE ${prisma.join(conditions, prisma.sql` AND `)}
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt") DESC
      `;

    return rows.map((row) => ({
      date: row.date,
      transaction: row.transactions,
      rewardRedeemed: row.rewardredeemed ?? 0,
      netProgramCost: `$${row.programcost ?? 0}`,
    }));
  }, []);

  /* ---------- FINAL RESPONSE ---------- */

  return {
    stats: {
      totalCustomers,
      rewardRedeemed,
      totalVisitsThisMonth,
    },
    table,
  };
};
