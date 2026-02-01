import prisma from "../../../prisma/client.js";

/* =========================
   LIST SUPPORT TICKETS
========================= */
export const getSystemOwnerSupportTicketsService = async (query) => {
  const { page = 1, limit = 10, status, priority, search } = query;

  const where = {
    ...(status && { status }),
    ...(priority && { priority }),
    ...(search && {
      subject: {
        contains: search,
        mode: "insensitive",
      },
    }),
  };

  const [tickets, total] = await Promise.all([
    prisma.support.findMany({
      where,
      include: {
        business: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: Number(limit),
    }),
    prisma.support.count({ where }),
  ]);

  return {
    tickets: tickets.map((t) => ({
      id: t.id,
      ticketNo: t.ticketNo,
      businessName: t.business?.name ?? "System",
      date: t.createdAt,
      issue: t.subject,
      priority: t.priority,
      status: t.status,
    })),
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* =========================
   VIEW SUPPORT TICKET (BY ID)
========================= */
export const getSystemOwnerSupportTicketByIdService = async (id) => {
  return prisma.support.findUnique({
    where: { id },
    include: {
      business: {
        select: { name: true },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/* =========================
   UPDATE SUPPORT TICKET STATUS
========================= */
export const updateSystemOwnerSupportTicketStatusByIdService = async (
  id,
  status,
) => {
  const updateData = { status };

  if (status === "RESOLVED") {
    updateData.resolvedAt = new Date();
  }

  if (status === "CLOSED") {
    updateData.closedAt = new Date();
  }

  return prisma.support.update({
    where: { id },
    data: updateData,
  });
};
