export const WritingPreferenceModel = {
  findByUserProfileId: async (prisma, userProfileId) =>
    prisma.writingPreference.findUnique({
      where: { userProfileId },
    }),

  upsertByUserProfileId: async (prisma, userProfileId, data) =>
    prisma.writingPreference.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    }),

  deleteByUserProfileId: async (prisma, userProfileId) =>
    prisma.writingPreference.delete({
      where: { userProfileId },
    }),
};
