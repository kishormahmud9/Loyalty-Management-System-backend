export const StudentAwardModel = {
  create: async (prisma, data) =>
    prisma.studentAward.create({ data }),

  findByUserProfileId: async (prisma, userProfileId) =>
    prisma.studentAward.findMany({
      where: { userProfileId },
    }),

  updateById: async (prisma, id, data) =>
    prisma.studentAward.update({
      where: { id },
      data,
    }),

  deleteById: async (prisma, id) =>
    prisma.studentAward.delete({ where: { id } }),
};
