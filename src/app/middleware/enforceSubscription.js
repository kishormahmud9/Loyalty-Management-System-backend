import { AppError } from "../errorHelper/appError.js";
import prisma from "../prisma/client.js";


export const enforceSubscription = async (req, res, next) => {
    try {
        const { businessId, role } = req.user;

        // Only enforce for Business Owner
        // Staff members are already restricted by permissions, 
        // but their actions are tied to the business's subscription status.
        if (!businessId) {
            return next();
        }

        const subscription = await prisma.businessSubscription.findFirst({
            where: { businessId, status: "ACTIVE" },
            orderBy: { createdAt: 'desc' }
        });

        const now = new Date();

        if (
            !subscription ||
            subscription.status !== "ACTIVE" ||
            (subscription.endDate && subscription.endDate < now)
        ) {
            throw new AppError(403, "Active subscription required to perform this action. Your trial or plan may have expired.");
        }

        next();
    } catch (error) {
        next(error);
    }
};
