import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createSubscriptionIntoDB = async (payload) => {
    const result = await prisma.billing.create({
        data: payload,
    });
    return result;
};

const getAllSubscriptionFromDB = async () => {
    const result = await prisma.billing.findMany({
        include: {
            business: true,
        },
    });
    return result;
};

const getSubscriptionByIdFromDB = async (id) => {
    const result = await prisma.billing.findUnique({
        where: {
            id: id,
        },
        include: {
            business: true,
        },
    });
    return result;
};

const updateSubscriptionIntoDB = async (id, payload) => {
    const result = await prisma.billing.update({
        where: {
            id: id,
        },
        data: payload,
    });
    return result;
};

const getAllAvailablePlansFromDB = async () => {
    const result = await prisma.plan.findMany({
        where: {
            isActive: true,
        },
        orderBy: {
            price: "asc",
        },
    });
    return result;
};

export const SubscriptionServices = {
    createSubscriptionIntoDB,
    getAllSubscriptionFromDB,
    getSubscriptionByIdFromDB,
    updateSubscriptionIntoDB,
    getAllAvailablePlansFromDB,
};
