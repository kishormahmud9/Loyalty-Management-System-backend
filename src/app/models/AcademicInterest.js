export const AcademicInterestModel = {
  findByUserProfileId: async (prisma, userProfileId) =>
    prisma.academicInterest.findUnique({
      where: { userProfileId },
    }),

  upsertByUserProfileId: async (prisma, userProfileId, data) =>
    prisma.academicInterest.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    }),

  deleteByUserProfileId: async (prisma, userProfileId) =>
    prisma.academicInterest.delete({
      where: { userProfileId },
    }),
};
