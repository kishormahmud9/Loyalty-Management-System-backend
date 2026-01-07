export const StudentScholarshipInterestModel = {
  findByUserProfileId: async (prisma, userProfileId) =>
    prisma.studentScholarshipInterest.findUnique({
      where: { userProfileId },
    }),

  upsertByUserProfileId: async (prisma, userProfileId, data) =>
    prisma.studentScholarshipInterest.upsert({
      where: { userProfileId },
      update: data,
      create: {
        userProfileId,
        ...data,
      },
    }),

  deleteByUserProfileId: async (prisma, userProfileId) =>
    prisma.studentScholarshipInterest.delete({
      where: { userProfileId },
    }),
};
