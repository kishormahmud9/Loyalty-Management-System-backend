import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createSubscriptionIntoDB = async (payload) => {
    const result = await prisma.billing.create({
        data: {
            ...payload,
            invoiceNo: payload.invoiceNo || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
            date: payload.date || new Date(),
        },
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
            monthlyPrice: "asc",
        },
    });
    return result;
};

const getMySubscriptionHistoryFromDB = async (ownerId) => {
    const result = await prisma.businessSubscription.findMany({
        where: {
            business: {
                ownerId: ownerId
            }
        },
        include: {
            business: true,
            plan: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
    return result;
};
const getCurrentSubscriptionFromDB = async (businessId) => {
    const result = await prisma.businessSubscription.findFirst({
        where: {
            businessId: businessId,
            status: "ACTIVE",
        },
        include: {
            plan: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return result;
};

const getBillingHistoryFromDB = async (ownerId) => {
    const result = await prisma.billing.findMany({
        where: {
            business: {
                ownerId: ownerId
            }
        },
        include: {
            business: true
        },
        orderBy: {
            date: "desc"
        }
    });
    return result;
};

export const SubscriptionServices = {
    createSubscriptionIntoDB,
    getAllSubscriptionFromDB,
    getSubscriptionByIdFromDB,
    updateSubscriptionIntoDB,
    getAllAvailablePlansFromDB,
    getMySubscriptionHistoryFromDB,
    getCurrentSubscriptionFromDB,
    getBillingHistoryFromDB
};
