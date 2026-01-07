export const EssayNarrativeModel = {
  findByUserProfileId: async (prisma, userProfileId) =>
    prisma.essayNarrative.findUnique({
      where: { userProfileId },
    }),

  upsertByUserProfileId: async (prisma, userProfileId, data) =>
    prisma.essayNarrative.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    }),

  deleteByUserProfileId: async (prisma, userProfileId) =>
    prisma.essayNarrative.delete({
      where: { userProfileId },
    }),
};
