import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";

class NotificationSettingsService {
    /**
     * Get notification settings for a business owner (Dynamic JSON)
     */
    static async getBusinessOwnerSettings(businessId) {
        let record = await prisma.businessOwnerNotification.findUnique({
            where: { businessId }
        });

        if (!record) {
            // Default settings based on UI Design
            const defaultSettings = [
                { option: "Login Alerts", channel: "Email,In App", value: true },
                { option: "Password Change", channel: "In App", value: true },
                { option: "In App Notification", channel: "Bell Icon", value: true },
                { option: "SMS Alerts", channel: "Critical Alert", value: false },
                { option: "Enable Card All Location", channel: "App", value: true }
            ];

            record = await prisma.businessOwnerNotification.create({
                data: {
                    businessId,
                    settings: defaultSettings
                }
            });
        }

        return record.settings;
    }

    /**
     * Upsert notification settings for a business owner
     */
    static async upsertBusinessOwnerSettings(businessId, settings) {
        if (!Array.isArray(settings)) {
            throw new AppError(400, "Settings must be an array of objects: [{option, channel, value}]");
        }

        const record = await prisma.businessOwnerNotification.upsert({
            where: { businessId },
            update: { settings },
            create: {
                businessId,
                settings
            }
        });

        return record.settings;
    }

    /**
     * Get notification settings for ALL branches of a business
     */
    static async getAllBranchesSettings(businessId) {
        const branches = await prisma.branch.findMany({
            where: { businessId },
            include: { notificationSetting: true }
        });

        return branches.map(branch => {
            const settings = branch.notificationSetting?.settings || [
                { option: branch.name || "Branch Notification", channel: "App", value: true }
            ];
            return {
                branchId: branch.id,
                branchName: branch.name,
                settings
            };
        });
    }

    /**
     * Upsert notification settings for ALL branches of a business
     */
    static async upsertAllBranchesSettings(businessId, settings) {
        if (!Array.isArray(settings)) {
            throw new AppError(400, "Settings must be an array of objects: [{option, channel, value}]");
        }

        const branches = await prisma.branch.findMany({
            where: { businessId }
        });

        const operations = branches.map(branch =>
            prisma.branchNotificationSetting.upsert({
                where: { branchId: branch.id },
                update: { settings },
                create: {
                    branchId: branch.id,
                    settings
                }
            })
        );

        await Promise.all(operations);
        return this.getAllBranchesSettings(businessId);
    }
}

export default NotificationSettingsService;
