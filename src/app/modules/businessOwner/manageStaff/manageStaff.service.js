// services/staff.service.js

export const StaffService = {
  create(prisma, data) {
    return prisma.staff.create({
      data,
    })
  },

  findAll(prisma, filters = {}) {
    return prisma.staff.findMany({
      where: filters,
      include: {
        user: true,
        business: true,
        branch: true,
      },
    })
  },

  findById(prisma, id) {
    return prisma.staff.findUnique({
      where: { id },
      include: {
        user: true,
        business: true,
        branch: true,
      },
    })
  },

  update(prisma, id, data) {
    return prisma.staff.update({
      where: { id },
      data,
    })
  },

  deactivate(prisma, id) {
    return prisma.staff.update({
      where: { id },
      data: { isActive: false },
    })
  },

  remove(prisma, id) {
    return prisma.staff.delete({
      where: { id },
    })
  },
}
