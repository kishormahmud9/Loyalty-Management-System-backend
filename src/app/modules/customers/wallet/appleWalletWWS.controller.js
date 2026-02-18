import prisma from "../../../prisma/client.js";
import { appleWalletService } from "./appleWallet.service.js";
import CustomerWalletService from "./wallet.service.js";

class AppleWalletWWSController {
    /**
     * POST /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}
     * Register a device to receive push notifications for a pass.
     */
    static async registerDevice(req, res) {
        const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = req.params;
        const pushToken = req.body.pushToken;
        const authHeader = req.headers.authorization;

        console.log(`[WWS_DEBUG] Request to registerDevice. Headers:`, JSON.stringify(req.headers));

        if (!authHeader || !authHeader.startsWith("ApplePass ")) {
            return res.status(401).send();
        }

        const authToken = authHeader.replace("ApplePass ", "").trim();
        console.log(`[WWS_AUTH] Verifying token for serial: ${serialNumber}`);
        console.log(`[WWS_AUTH] Received Token: ${authToken}`);


        // 1. Verify pass exists and auth token matches
        const passRecord = await prisma.applePass.findUnique({
            where: { serialNumber }
        });

        if (!passRecord || passRecord.authenticationToken !== authToken) {
            console.log(`[WWS_DEBUG] ❌ Auth Failed for serial: ${serialNumber}`);
            if (passRecord) {
                console.log(`[WWS_DEBUG] Expected: ${passRecord.authenticationToken}, Received: ${authToken}`);
            } else {
                console.log(`[WWS_DEBUG] Pass record not found for serial: ${serialNumber}`);
            }
            return res.status(401).send();
        }

        // 2. Upsert device
        await prisma.appleDevice.upsert({
            where: { deviceLibraryIdentifier },
            update: { pushToken },
            create: { deviceLibraryIdentifier, pushToken }
        });

        // 3. Create registration
        await prisma.appleRegistration.upsert({
            where: {
                deviceLibraryIdentifier_passTypeIdentifier_serialNumber: {
                    deviceLibraryIdentifier,
                    passTypeIdentifier,
                    serialNumber
                }
            },
            update: {},
            create: {
                deviceLibraryIdentifier,
                passTypeIdentifier,
                serialNumber
            }
        });

        return res.status(201).send();
    }

    /**
     * DELETE /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}
     * Unregister a device.
     */
    static async unregisterDevice(req, res) {
        const { deviceLibraryIdentifier, passTypeIdentifier, serialNumber } = req.params;
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("ApplePass ")) {
            return res.status(401).send();
        }

        const authToken = authHeader.replace("ApplePass ", "").trim();
        console.log(`[WWS_AUTH] Unregistering device. Verifying token for serial: ${serialNumber}`);
        console.log(`[WWS_AUTH] Received Token: ${authToken}`);


        // 1. Verify pass exists and auth token matches
        const passRecord = await prisma.applePass.findUnique({
            where: { serialNumber }
        });

        if (!passRecord || passRecord.authenticationToken !== authToken) {
            return res.status(401).send();
        }

        // 2. Remove registration
        await prisma.appleRegistration.deleteMany({
            where: {
                deviceLibraryIdentifier,
                passTypeIdentifier,
                serialNumber
            }
        });

        return res.status(200).send();
    }

    /**
     * GET /v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}?passesUpdatedSince=...
     * Get the serial numbers of passes that have changed since a given tag.
     */
    static async getUpdatedPasses(req, res) {
        const { deviceLibraryIdentifier, passTypeIdentifier } = req.params;
        const passesUpdatedSince = req.query.passesUpdatedSince;

        console.log(`[WWS_DEBUG] Querying updated passes for:`);
        console.log(` - Device: ${deviceLibraryIdentifier}`);
        console.log(` - PassType: ${passTypeIdentifier}`);
        console.log(` - UpdatedSince: ${passesUpdatedSince}`);

        // 1. Find all registrations for this device and pass type
        const registrations = await prisma.appleRegistration.findMany({
            where: {
                deviceLibraryIdentifier,
                passTypeIdentifier,
                pass: {
                    lastUpdated: passesUpdatedSince ? { gt: new Date(passesUpdatedSince) } : undefined
                }
            },
            include: {
                pass: true
            }
        });

        console.log(`[WWS_DEBUG] Found ${registrations.length} registrations.`);

        if (registrations.length === 0) {
            return res.status(204).send();
        }

        const serialNumbers = registrations.map(r => r.serialNumber);
        const lastUpdated = registrations.reduce((latest, r) => {
            return r.pass.lastUpdated > latest ? r.pass.lastUpdated : latest;
        }, new Date(0));

        return res.status(200).json({
            lastUpdated: lastUpdated.toISOString(),
            serialNumbers
        });
    }

    /**
     * GET /v1/passes/{passTypeIdentifier}/{serialNumber}
     * Get the latest version of a pass.
     */
    static async getLatestPass(req, res) {
        const { passTypeIdentifier, serialNumber } = req.params;
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("ApplePass ")) {
            return res.status(401).send();
        }

        const authToken = authHeader.replace("ApplePass ", "").trim();
        console.log(`[WWS_AUTH] Getting latest pass. Verifying token for serial: ${serialNumber}`);
        console.log(`[WWS_AUTH] Received Token: ${authToken}`);


        // 1. Verify pass exists and auth token matches
        const passRecord = await prisma.applePass.findUnique({
            where: { serialNumber }
        });

        if (!passRecord || passRecord.authenticationToken !== authToken || passRecord.passTypeIdentifier !== passTypeIdentifier) {
            return res.status(401).send();
        }
        try {
            // 2. Parse customerId and cardId from serialNumber (format: customerId_cardId)
            const [customerId, cardId] = serialNumber.split("_");

            // 3. Get the latest pass buffer using existing service logic
            const { buffer, filename } = await CustomerWalletService.getAppleWalletPass(customerId, cardId);

            // 4. Send the pass
            res.setHeader("Content-Type", "application/vnd.apple.pkpass");
            res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
            res.setHeader("Last-Modified", passRecord.lastUpdated.toUTCString());
            return res.send(buffer);
        } catch (error) {
            console.error("Error regenerating pass for update:", error);
            return res.status(500).send();
        }
    }
    /**
     * GET /v1/passes/{passTypeIdentifier}/{serialNumber}/download-link
     * Returns the download link and authenticationToken for a specific serial number.
     */
    static async getPassDownloadLink(req, res) {
        const { passTypeIdentifier, serialNumber } = req.params;

        try {
            const [customerId, cardId] = serialNumber.split("_");
            if (!customerId || !cardId) {
                return res.status(400).json({ success: false, message: "Invalid serial number format" });
            }

            // Verify pass exists
            const passRecord = await prisma.applePass.findUnique({
                where: { serialNumber }
            });

            if (!passRecord || passRecord.passTypeIdentifier !== passTypeIdentifier) {
                return res.status(404).json({ success: false, message: "Pass not found" });
            }

            const result = await CustomerWalletService.getAppleWalletLink(customerId, cardId);

            return res.status(200).json({
                success: true,
                data: {
                    ...result,
                    serialNumber
                }
            });
        } catch (error) {
            console.error("Error fetching pass download link:", error);
            return res.status(500).json({ success: false, message: "Error fetching link" });
        }
    }
}

export default AppleWalletWWSController;
