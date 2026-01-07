export const StudentWorkModel = {
  create: async (prisma, data) =>
    prisma.studentWork.create({ data }),

  findByUserProfileId: async (prisma, userProfileId) =>
    prisma.studentWork.findMany({
      where: { userProfileId },
    }),

  updateById: async (prisma, id, data) =>
    prisma.studentWork.update({
      where: { id },
      data,
    }),

  deleteById: async (prisma, id) =>
    prisma.studentWork.delete({ where: { id } }),
};
