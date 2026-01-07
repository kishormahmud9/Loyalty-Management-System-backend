export const UserLogModel = {
  create: async (prisma, data) => prisma.userLog.create({ data }),
  findById: async (prisma, id) =>
    prisma.userDetails.findUnique({ where: { id } }),
  findAll: async (prisma) =>
    prisma.userDetails.findMany({
      include: { user: true, business: true },
    }),
};
