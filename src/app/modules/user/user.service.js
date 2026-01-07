export const UserService = {
  create: async (prisma, data) => prisma.user.create({ data }),
  findByEmail: async (prisma, email) =>
    prisma.user.findUnique({ where: { email } }),
  findByUsername: async (prisma, username) =>
    prisma.user.findUnique({ where: { username } }),
  findById: async (prisma, id) => prisma.user.findUnique({ where: { id } }),
  findAll: async (prisma) =>
    prisma.user.findMany({
      include: { business: true },
    }),
  // ✅ Update user by ID
  update: async (prisma, id, data) =>
    prisma.user.update({
      where: { id },
      data,
    }),

  // ✅ Delete user by ID
  delete: async (prisma, id) =>
    prisma.user.delete({
      where: { id },
    }),

  // ✅ User + Full Profile (ALL relations)
  findByIdWithProfile: async (prisma, id) =>
    prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            educations: true,
            activities: true,
            work: true,
            volunteer: true,
            awards: true,
            challenges: true,
            essays: true,
            academicInterest: true,
            scholarships: true,
            progress: true,
            familyBackground: true,
            studentIdentity: true,
            essayNarrative: true,
            writingPreference: true,
            uniqueExperience: true,
          },
        },
      },
    }),

  findAllWithProfile: async (prisma) =>
    prisma.user.findMany({
      include: {
        profile: {
          include: {
            educations: true,
            activities: true,
            work: true,
            volunteer: true,
            awards: true,
            challenges: true,
            essays: true,
            academicInterest: true,
            scholarships: true,
            progress: true,
            familyBackground: true,
            studentIdentity: true,
            essayNarrative: true,
            writingPreference: true,
            uniqueExperience: true,
          },
        },
      },
    }),
};
