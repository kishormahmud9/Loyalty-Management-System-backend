export const BusinessModel = {
  create: async (prisma, data) => prisma.business.create({ data }),
  findByEmail: async (prisma, email) =>
    prisma.business.findUnique({ where: { email } }),
  findBySlug: async (prisma, slug) =>
    prisma.business.findUnique({ where: { slug } }),
  findById: async (prisma, id) => prisma.business.findUnique({ where: { id } }),
  findAll: async (prisma) =>
    prisma.business.findMany({
      include: { user: true },
    }),
};
