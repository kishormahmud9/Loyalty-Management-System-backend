export const UserDetailsModel = {
  create: async (prisma, data) => prisma.userDetails.create({ data }),
  findById: async (prisma, id) =>
    prisma.userDetails.findUnique({ where: { id } }),
   findAll: async (prisma) =>
    prisma.userDetails.findMany({
      include: { user: true },
    }),
};
