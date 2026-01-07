export const EducationModel = {
  create: async (prisma, data) =>
    prisma.education.create({ data }),

  findById: async (prisma, id) =>
    prisma.education.findUnique({ where: { id } }),

  findByUserProfileId: async (prisma, userProfileId) =>
    prisma.education.findMany({
      where: { userProfileId },
      orderBy: { startYear: 'desc' },
    }),

  updateById: async (prisma, id, data) =>
    prisma.education.update({
      where: { id },
      data,
    }),

  deleteById: async (prisma, id) =>
    prisma.education.delete({ where: { id } }),
};
