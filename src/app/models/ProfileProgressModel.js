export const ProfileProgressModel = {
  findByUserProfileId: async (prisma, userProfileId) =>
    prisma.profileProgress.findUnique({
      where: { userProfileId },
    }),

  upsertByUserProfileId: async (prisma, userProfileId, data) =>
    prisma.profileProgress.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    }),
};
