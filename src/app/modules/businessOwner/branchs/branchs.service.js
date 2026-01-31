// services/branch.service.js

export const BranchService = {
  create(prisma, data) {
    return prisma.branch.create({
      data,
    })
  },

  findAll(prisma, businessId) {
    return prisma.branch.findMany({
      where: { businessId },
    })
  },

  findMyBranchesMinimal(prisma, businessId) {
    return prisma.branch.findMany({
      where: { businessId },
      select: {
        id: true,
        name: true,
      },
    })
  },

  findById(prisma, id) {
    return prisma.branch.findUnique({
      where: { id },
    })
  },

  update(prisma, id, data) {
    return prisma.branch.update({
      where: { id },
      data,
    })
  },

  remove(prisma, id) {
    return prisma.branch.delete({
      where: { id },
    })
  },
}
