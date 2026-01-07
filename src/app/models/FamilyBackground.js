export const FamilyBackgroundModel = {
  findByUserProfileId: async (prisma, userProfileId) =>
    prisma.familyBackground.findUnique({
      where: { userProfileId },
    }),

  upsertByUserProfileId: async (prisma, userProfileId, data) =>
    prisma.familyBackground.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    }),

  deleteByUserProfileId: async (prisma, userProfileId) =>
    prisma.familyBackground.delete({
      where: { userProfileId },
    }),
};
