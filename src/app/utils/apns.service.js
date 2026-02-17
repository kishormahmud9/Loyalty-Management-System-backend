import apn from "@parse/node-apn";
import fs from "fs";
import path from "path";
import { envVars } from "../config/env.js";

class ApnsService {
    constructor() {
        this.provider = null;
        this.init();
    }

    init() {
        const { APNS_KEY_PATH, APNS_KEY_ID, TEAM_ID } = envVars.APPLE_WALLET;

        if (!APNS_KEY_PATH || !APNS_KEY_ID || !TEAM_ID) {
            console.warn("APNs credentials missing. Push notifications for Apple Wallet will not work.");
            return;
        }

        const absoluteKeyPath = path.resolve(process.cwd(), APNS_KEY_PATH);
        if (!fs.existsSync(absoluteKeyPath)) {
            console.error(`APNs key not found at ${absoluteKeyPath}`);
            return;
        }

        try {
            this.provider = new apn.Provider({
                token: {
                    key: absoluteKeyPath,
                    keyId: APNS_KEY_ID,
                    teamId: TEAM_ID,
                },
                production: envVars.NODE_ENV === "production",
            });
            console.log("APNs Provider initialized successfully.");
        } catch (error) {
            console.error("Failed to initialize APNs Provider:", error);
        }
    }

    /**
     * Send a silent push notification to tell the device to check for pass updates.
     * @param {string} pushToken - The push token obtained from device registration.
     */
    async sendPassUpdatePush(pushToken) {
        if (!this.provider) {
            console.warn("APNs Provider not initialized. Cannot send push.");
            return;
        }

        const notification = new apn.Notification();
        // For Apple Wallet updates, the payload must be empty.
        notification.payload = {};
        notification.topic = envVars.APPLE_WALLET.PASS_TYPE_ID;

        try {
            const result = await this.provider.send(notification, pushToken);
            if (result.failed.length > 0) {
                console.error("APNs Push Failed:", result.failed);
            } else {
                console.log(`Apple Wallet push sent successfully to token: ${pushToken.substring(0, 10)}...`);
            }
            return result;
        } catch (error) {
            console.error("Error sending APNs push:", error);
            throw error;
        }
    }

    /**
     * Shutdown the provider
     */
    shutdown() {
        if (this.provider) {
            this.provider.shutdown();
        }
    }
}

export const apnsService = new ApnsService();
