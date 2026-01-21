import prisma from "../../../prisma/client.js";

export const getSystemOwnerAuditLogsService = async (query) => {
  const { page = 1, limit = 10, search, businessId } = query;

  const where = {
    ...(businessId && { businessId }),
    ...(search && {
      OR: [
        {
          action: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          business: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ],
    }),
  };

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        business: {
          select: { name: true },
        },
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: Number(limit),
    }),
    prisma.activityLog.count({ where }),
  ]);

  return {
    logs: logs.map((log) => ({
      id: log.id,
      businessName: log.business?.name ?? "System",
      date: log.createdAt,
      action: log.action,
      details: log.metadata,
    })),
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const exportSystemOwnerAuditLogsCSVService = async (query) => {
  const { search, businessId, from, to } = query;

  const where = {
    ...(businessId && { businessId }),
    ...(from || to
      ? {
          createdAt: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) }),
          },
        }
      : {}),
    ...(search && {
      OR: [
        {
          action: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          business: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ],
    }),
  };

  const logs = await prisma.activityLog.findMany({
    where,
    include: {
      business: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // CSV Header
  let csv = "Business Name,Date,Time,Action,Details\n";

  logs.forEach((log) => {
    const date = log.createdAt.toISOString().split("T")[0];
    const time = log.createdAt.toISOString().split("T")[1].split(".")[0];

    const details = log.metadata
      ? JSON.stringify(log.metadata).replace(/"/g, '""')
      : "";

    csv += `"${log.business?.name ?? "System"}","${date}","${time}","${
      log.action
    }","${details}"\n`;
  });

  return csv;
};
