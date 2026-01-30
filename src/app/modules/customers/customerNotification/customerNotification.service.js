import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";
import { StatusCodes } from "http-status-codes";

export const CustomerNotificationService = {
    createOrUpdate: async (customerId, data) => {
        // Check if customer exists
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
        });

        if (!customer) {
            throw new AppError(StatusCodes.NOT_FOUND, "Customer not found");
        }

        return prisma.customerNotification.upsert({
            where: { customerId },
            update: data,
            create: {
                ...data,
                customerId,
            },
        });
    },

    getById: async (customerId) => {
        const notifications = await prisma.customerNotification.findUnique({
            where: { customerId },
        });

        if (!notifications) {
            // Return default settings if none exist yet
            return {
                smsUpdates: false,
                allowLocation: false,
                pushNotification: false,
                birthdayRewards: false,
            };
        }

        return notifications;
    },

    delete: async (customerId) => {
        return prisma.customerNotification.delete({
            where: { customerId },
        });
    },
};
