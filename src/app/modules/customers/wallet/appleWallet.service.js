import { PKPass } from "passkit-generator";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { envVars } from "../../../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AppleWalletService {
    constructor() {
        this.passTypeId = envVars.APPLE_WALLET.PASS_TYPE_ID;
        this.teamId = envVars.APPLE_WALLET.TEAM_ID;
        this.p12Passphrase = envVars.APPLE_WALLET.P12_PASSWORD;
        this.p12Path = path.resolve(process.cwd(), envVars.APPLE_WALLET.P12_PATH || "apple_wallet.p12");

        // WWDR certificate is required for signing. 
        this.wwdrPath = path.resolve(process.cwd(), "WWDR.pem");
    }

    /**
     * Generate an Apple Wallet Pass (.pkpass)
     * @param {Object} data - Information to include in the pass
     * @param {Object} card - Card model data
     * @returns {Promise<Buffer>} - Generated .pkpass buffer
     */
    async generatePass(data, card) {
        try {
            // Check if certificates exist
            if (!fs.existsSync(this.p12Path)) {
                throw new Error(`Apple Wallet P12 certificate not found at: ${this.p12Path}`);
            }

            // Apple Developer Portal WWDR certificate is also needed.
            // If not provided in root, we might fail.
            const wwdrContent = fs.existsSync(this.wwdrPath) ? fs.readFileSync(this.wwdrPath) : null;

            // 1. Prepare the core pass.json content
            const passJson = {
                formatVersion: 1,
                passTypeIdentifier: this.passTypeId,
                teamIdentifier: this.teamId,
                organizationName: card.companyName || "Belbedia",
                description: card.cardDesc || "Loyalty Card",
                sharingProhibited: false,
                backgroundColor: card.cardBackground,
                labelColor: card.textColor,
                barcodes: [
                    {
                        format: "PKBarcodeFormatQR",
                        message: data.customerId,
                        messageEncoding: "iso-8859-1",
                    },
                ],
                storeCard: {
                    primaryFields: [
                        {
                            key: "points",
                            label: "POINTS",
                            value: data.points || 0,
                        },
                    ],
                    secondaryFields: [
                        {
                            key: "customerName",
                            label: "CUSTOMER",
                            value: data.customerName || "Customer",
                        },
                    ],
                },
            };

            // 2. Initialize PKPass with the pass.json buffer
            const pass = new PKPass(
                {
                    "pass.json": Buffer.from(JSON.stringify(passJson)),
                },
                {
                    wwdr: wwdrContent,
                    signerCert: fs.readFileSync(this.p12Path),
                    signerKey: fs.readFileSync(this.p12Path),
                    signerKeyPassphrase: this.p12Passphrase,
                },
                {
                    serialNumber: data.serialNumber,
                }
            );

            // 3. Add images (Mandatory: icon, Optional: logo)
            const addImageFromPath = async (filePath, passName) => {
                if (!filePath) return false;
                const absolutePath = path.resolve(process.cwd(), filePath);
                if (fs.existsSync(absolutePath)) {
                    pass.addBuffer(`${passName}.png`, fs.readFileSync(absolutePath));
                    pass.addBuffer(`${passName}@2x.png`, fs.readFileSync(absolutePath));
                    return true;
                }
                return false;
            };

            // Every pass MUST have an icon.png
            const iconAdded = await addImageFromPath("uploads/default/icon.png", "icon");
            if (!iconAdded && card.logoFilePath) {
                // Fallback to logo as icon if specific icon doesn't exist
                await addImageFromPath(card.logoFilePath, "icon");
            }

            if (card.logoFilePath) await addImageFromPath(card.logoFilePath, "logo");

            // 4. Generate buffer
            return await pass.getAsBuffer();
        } catch (error) {
            console.error("Apple Wallet Generation Error:", error);
            throw error;
        }
    }
}

export const appleWalletService = new AppleWalletService();
