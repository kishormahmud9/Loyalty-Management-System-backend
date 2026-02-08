import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";

class NotificationSettingsService {
    /**
     * Get all notification settings for a business, including branch-specific toggles
     */
    static async getSettings(businessId) {
        const [generalSettings, branches] = await Promise.all([
            prisma.businessOwnerNotification.findUnique({
                where: { businessId }
            }),
            prisma.branch.findMany({
                where: { businessId },
                include: { notificationSetting: true }
            })
        ]);

        return {
            general: generalSettings || {
                loginAlerts: true,
                passwordChange: true,
                inAppNotification: true,
                smsAlerts: false,
                enableCardAllLocation: true
            },
            branches: branches.map(b => ({
                id: b.id,
                name: b.name,
                isEnabled: b.notificationSetting?.isEnabled ?? true
            }))
        };
    }

    /**
     * Unified upsert for all notification settings
     */
    static async upsertSettings(businessId, data) {
        const { general, branches } = data;

        const operations = [];

        // 1. Upsert General Settings if provided
        if (general) {
            const { id, createdAt, updatedAt, businessId: bId, ...updateData } = general;
            operations.push(
                prisma.businessOwnerNotification.upsert({
                    where: { businessId },
                    update: updateData,
                    create: {
                        businessId,
                        ...updateData
                    }
                })
            );
        }

        // 2. Upsert Branch Settings if provided
        if (branches && Array.isArray(branches)) {
            for (const branch of branches) {
                const { branchId, isEnabled } = branch;

                // Security verify branch belongs to business
                const branchExists = await prisma.branch.findFirst({
                    where: { id: branchId, businessId }
                });

                if (branchExists) {
                    operations.push(
                        prisma.branchNotificationSetting.upsert({
                            where: { branchId },
                            update: { isEnabled },
                            create: { branchId, isEnabled }
                        })
                    );
                }
            }
        }

        await Promise.all(operations);
        return this.getSettings(businessId);
    }
}

export default NotificationSettingsService;
