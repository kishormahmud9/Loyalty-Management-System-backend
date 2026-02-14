import prisma from "../../../prisma/client.js";

export const getGeoSettingService = async () => {
    const setting = await prisma.platformGeoSetting.findFirst();

    if (!setting) {
        throw new Error("Geo setting not configured");
    }

    return setting;
};

export const updateGeoSettingService = async (payload) => {
    const existing = await prisma.platformGeoSetting.findFirst();

    if (!existing) {
        throw new Error("Geo setting not found");
    }

    const updated = await prisma.platformGeoSetting.update({
        where: { id: existing.id },
        data: {
            isEnabled:
                payload.isEnabled !== undefined
                    ? payload.isEnabled
                    : existing.isEnabled,
            radiusMeters:
                payload.radiusMeters !== undefined
                    ? payload.radiusMeters
                    : existing.radiusMeters,
            cooldownHours:
                payload.cooldownHours !== undefined
                    ? payload.cooldownHours
                    : existing.cooldownHours,
        },
    });

    return updated;
};

export const getAllBranchesWithLocationService = async () => {
    const branches = await prisma.branch.findMany({
        where: {
            latitude: {
                not: null,
            },
            longitude: {
                not: null,
            },
            isActive: true,
        },
        select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            city: true,
            country: true,
            business: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    return branches;
};

export const updateBranchLocationService = async (
    branchId,
    latitude,
    longitude
) => {
    const branch = await prisma.branch.findUnique({
        where: { id: branchId },
    });

    if (!branch) {
        throw new Error("Branch not found");
    }

    const updated = await prisma.branch.update({
        where: { id: branchId },
        data: {
            latitude,
            longitude,
        },
    });

    return updated;
};
