export const StudentIdentityModel = {
  findByUserProfileId: async (prisma, userProfileId) =>
    prisma.studentIdentity.findUnique({
      where: { userProfileId },
    }),

  upsertByUserProfileId: async (prisma, userProfileId, data) =>
    prisma.studentIdentity.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    }),

  deleteByUserProfileId: async (prisma, userProfileId) =>
    prisma.studentIdentity.delete({
      where: { userProfileId },
    }),
};
