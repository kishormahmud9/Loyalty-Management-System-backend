import prisma from "../../../prisma/client.js";
import { getIO } from "../../../socket.js";

class NotificationBusinessService {
    /**
     * Notify business owner when a customer registers in a branch.
     */
    static async notifyCustomerRegistration(businessId, branchId, customerName) {
        try {
            const branch = await prisma.branch.findUnique({
                where: { id: branchId },
                select: { name: true }
            });

            const message = `Customer ${customerName} registered in branch: ${branch?.name || "Unknown Branch"}`;

            const notification = await prisma.notification.create({
                data: {
                    businessId,
                    branchId,
                    message,
                    sentByStaff: "SYSTEM",
                }
            });

            this.emitToBusiness(businessId, notification);
            return notification;
        } catch (error) {
            console.error("Error in notifyCustomerRegistration:", error.message);
        }
    }

    /**
     * Notify business owner when a customer earns points.
     */
    static async notifyPointsAwarded({ businessId, branchId, customerName, points, staffName, staffRole }) {
        try {
            const branch = await prisma.branch.findUnique({
                where: { id: branchId },
                select: { name: true }
            });

            const senderInfo = staffName ? `${staffName} (${staffRole})` : "Business Owner";
            const message = `Customer ${customerName} got ${points} points by ${senderInfo} at branch: ${branch?.name || "Unknown Branch"}`;

            const notification = await prisma.notification.create({
                data: {
                    businessId,
                    branchId,
                    message,
                    sentByStaff: "SYSTEM",
                }
            });

            this.emitToBusiness(businessId, notification);
            return notification;
        } catch (error) {
            console.error("Error in notifyPointsAwarded:", error.message);
        }
    }

    /**
     * Helper to emit socket event to business room.
     */
    static emitToBusiness(businessId, notification) {
        try {
            const io = getIO();
            io.to(`business:${businessId}`).emit("notification:new", {
                id: notification.id,
                message: notification.message,
                createdAt: notification.createdAt,
            });
            console.log(`📡 Notification emitted to business:${businessId}`);
        } catch (error) {
            console.warn("Socket emit failed:", error.message);
        }
    }

    /**
     * Get notification history for a business owner.
     */
    static async getNotificationHistory(businessId) {
        return prisma.notification.findMany({
            where: {
                businessId,
                sentByStaff: "SYSTEM"
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 50 // Limit to latest 50 notifications
        });
    }
}

export default NotificationBusinessService;
