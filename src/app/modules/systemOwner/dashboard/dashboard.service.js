import prisma from "../../../prisma/client.js";

export const getSystemOwnerDashboardOverviewService = async () => {
  // SAFE DEFAULT RESPONSE (never breaks UI)
  const response = {
    stats: {
      tenantsRegistered: 0,
      activeTenants: 0,
      supportTickets: 0,
      billingIssues: 0,
    },
    tenantsTable: [],
    tenantsGrowth: [
      { month: "Jan", count: 0 },
      { month: "Feb", count: 0 },
      { month: "Mar", count: 0 },
      { month: "Apr", count: 0 },
      { month: "May", count: 0 },
      { month: "Jun", count: 0 },
      { month: "Jul", count: 0 },
      { month: "Aug", count: 0 },
      { month: "Sep", count: 0 },
      { month: "Oct", count: 0 },
      { month: "Nov", count: 0 },
      { month: "Dec", count: 0 },
    ],
    supportTicketSummary: {
      high: 0,
      medium: 0,
      low: 0,
    },
  };

  /* =========================
     BUSINESS / TENANT STATS
  ========================= */
  try {
    const [totalTenants, activeTenants, recentTenants, allTenants] =
      await Promise.all([
        prisma.business.count(),
        prisma.business.count({ where: { isActive: true } }),
        prisma.business.findMany({
          select: {
            id: true,
            name: true,
            isActive: true,
            branches: { select: { id: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.business.findMany({
          select: { createdAt: true },
        }),
      ]);

    response.stats.tenantsRegistered = totalTenants;
    response.stats.activeTenants = activeTenants;

    // Tenants table (Merchant list)
    response.tenantsTable = recentTenants.map((b) => ({
      name: b.name,
      activeTenants: b.branches.length, // branch count
      status: b.isActive ? "Active" : "Inactive",
    }));

    // Tenants growth chart
    allTenants.forEach((b) => {
      const monthIndex = new Date(b.createdAt).getMonth();
      response.tenantsGrowth[monthIndex].count += 1;
    });
  } catch (error) {
    console.error("Dashboard Business Error:", error.message);
  }

  /* =========================
     SUPPORT TICKET STATS
  ========================= */
  try {
    const [totalTickets, ticketByPriority] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.groupBy({
        by: ["priority"],
        _count: { priority: true },
      }),
    ]);

    response.stats.supportTickets = totalTickets;

    ticketByPriority.forEach((item) => {
      if (item.priority === "HIGH")
        response.supportTicketSummary.high = item._count.priority;
      if (item.priority === "MEDIUM")
        response.supportTicketSummary.medium = item._count.priority;
      if (item.priority === "LOW")
        response.supportTicketSummary.low = item._count.priority;
    });
  } catch (error) {
    console.error("Dashboard SupportTicket Error:", error.message);
  }

  /* =========================
     BILLING ISSUES
  ========================= */
  try {
    const billingIssues = await prisma.billing.count({
      where: { issue: true },
    });

    response.stats.billingIssues = billingIssues;
  } catch (error) {
    console.error("Dashboard Billing Error:", error.message);
  }

  return response;
};
