export const StudentVolunteerModel = {
  create: async (prisma, data) =>
    prisma.studentVolunteer.create({ data }),

  findByUserProfileId: async (prisma, userProfileId) =>
    prisma.studentVolunteer.findMany({
      where: { userProfileId },
    }),

  updateById: async (prisma, id, data) =>
    prisma.studentVolunteer.update({
      where: { id },
      data,
    }),

  deleteById: async (prisma, id) =>
    prisma.studentVolunteer.delete({ where: { id } }),
};
