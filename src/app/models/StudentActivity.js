export const StudentActivityModel = {
  create: async (prisma, data) =>
    prisma.studentActivity.create({ data }),

  findByUserProfileId: async (prisma, userProfileId) =>
    prisma.studentActivity.findMany({
      where: { userProfileId },
    }),

  updateById: async (prisma, id, data) =>
    prisma.studentActivity.update({
      where: { id },
      data,
    }),

  deleteById: async (prisma, id) =>
    prisma.studentActivity.delete({ where: { id } }),
};
