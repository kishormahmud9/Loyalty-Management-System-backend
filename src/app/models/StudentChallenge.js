export const StudentChallengeModel = {
  create: async (prisma, data) =>
    prisma.studentChallenge.create({ data }),

  findByUserProfileId: async (prisma, userProfileId) =>
    prisma.studentChallenge.findMany({
      where: { userProfileId },
    }),

  updateById: async (prisma, id, data) =>
    prisma.studentChallenge.update({
      where: { id },
      data,
    }),

  deleteById: async (prisma, id) =>
    prisma.studentChallenge.delete({ where: { id } }),
};
