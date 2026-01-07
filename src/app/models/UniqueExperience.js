export const UniqueExperienceModel = {
  findByUserProfileId: async (prisma, userProfileId) =>
    prisma.uniqueExperience.findUnique({
      where: { userProfileId },
    }),

  upsertByUserProfileId: async (prisma, userProfileId, data) =>
    prisma.uniqueExperience.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    }),

  deleteByUserProfileId: async (prisma, userProfileId) =>
    prisma.uniqueExperience.delete({
      where: { userProfileId },
    }),
};
    