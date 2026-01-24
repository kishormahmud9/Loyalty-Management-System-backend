
export const StaffPermissionService = {
    upsertPermission(prisma, businessId, data) {
        return prisma.staffPermission.upsert({
            where: { businessId },
            update: {
                ...data,
            },
            create: {
                businessId,
                ...data,
            },
        });
    },

    getPermissionByBusinessId(prisma, businessId) {
        return prisma.staffPermission.findUnique({
            where: { businessId },
        });
    },
};
