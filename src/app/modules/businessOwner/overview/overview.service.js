// overview.service.js
import prisma from "../../../prisma/client.js";

const safe = async (fn, fallback) => {
  try {
    return await fn();
  } catch (e) {
    console.error("Overview error:", e.message);
    return fallback;
  }
};

export const getOverviewData = async (userId) => {
  /* ---------- GET BUSINESS ---------- */
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
    select: { id: true },
  });

  if (!business) {
    return {
      stats: {},
      charts: {},
      topRewards: [],
      redemptionBreakdown: {},
    };
  }

  const businessId = business.id;

  /* ---------- TOP STATS ---------- */

  const totalCustomers = await safe(
    () => prisma.customerBranchData.count({ where: { businessId } }),
    0,
  );

  const totalStaff = await safe(
    () => prisma.staff.count({ where: { businessId, isActive: true } }),
    0,
  );

  const rewardRedeemed = await safe(
    () =>
      prisma.claimReward.count({
        where: {
          redeemReward: { businessId },
          claimStatus: "CLAIMED",
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
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    0,
  );

  /* ---------- MONTHLY VISIT + REDEEM CHART ---------- */

  const monthlyData = await safe(async () => {
    const visits = await prisma.$queryRaw`
        SELECT TO_CHAR("createdAt",'Mon') AS month, COUNT(*)::int AS visit
        FROM "PointTransaction"
        WHERE "businessId"=${businessId} AND type='EARN'
        GROUP BY month
      `;

    const redeems = await prisma.$queryRaw`
        SELECT TO_CHAR("createdAt",'Mon') AS month, COUNT(*)::int AS redeem
        FROM "ClaimReward"
        WHERE "claimStatus"='CLAIMED'
        GROUP BY month
      `;

    return visits.map((v) => ({
      month: v.month,
      visit: v.visit,
      redeem: redeems.find((r) => r.month === v.month)?.redeem || 0,
    }));
  }, []);

  /* ---------- TOP PERFORMING REWARDS ---------- */

  const topRewards = await safe(
    () =>
      prisma.redeemReward.findMany({
        where: { businessId },
        select: {
          rewardName: true,
          _count: { select: { claims: true } },
        },
        orderBy: { claims: { _count: "desc" } },
        take: 3,
      }),
    [],
  );

  /* ---------- REDEMPTION BREAKDOWN ---------- */

  const totalClaims = await safe(
    () =>
      prisma.claimReward.count({
        where: { redeemReward: { businessId } },
      }),
    0,
  );

  const claimed = await safe(
    () =>
      prisma.claimReward.count({
        where: { redeemReward: { businessId }, claimStatus: "CLAIMED" },
      }),
    0,
  );

  const pending = await safe(
    () =>
      prisma.claimReward.count({
        where: { redeemReward: { businessId }, claimStatus: "CLAIM" },
      }),
    0,
  );

  const expired = totalClaims - claimed - pending;

  const percent = (v) =>
    totalClaims === 0 ? 0 : Math.round((v / totalClaims) * 100);

  /* ---------- FINAL RETURN ---------- */

  return {
    stats: {
      totalCustomers,
      totalStaff,
      rewardRedeemed,
      totalVisitsThisMonth,
    },
    charts: {
      customerVisitAndRedeem: monthlyData,
    },
    topRewards: topRewards.map((r) => ({
      label: r.rewardName,
      value: r._count.claims,
    })),
    redemptionBreakdown: {
      claimed: percent(claimed),
      expired: percent(expired),
      pending: percent(pending),
    },
  };
};
