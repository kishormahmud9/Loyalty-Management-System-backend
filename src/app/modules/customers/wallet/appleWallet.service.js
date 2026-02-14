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
        this.signerCertPath = path.resolve(process.cwd(), envVars.APPLE_WALLET.SIGNER_CERT_PATH || "signerCert.pem");
        this.signerKeyPath = path.resolve(process.cwd(), envVars.APPLE_WALLET.SIGNER_KEY_PATH || "signerKey.pem");

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
            if (!fs.existsSync(this.signerCertPath)) {
                throw new Error(`Apple Wallet Signer Certificate not found at: ${this.signerCertPath}. Since version 3.0.0, passkit-generator requires PEM format.`);
            }
            if (!fs.existsSync(this.signerKeyPath)) {
                throw new Error(`Apple Wallet Signer Key not found at: ${this.signerKeyPath}. Since version 3.0.0, passkit-generator requires PEM format.`);
            }

            // Apple Developer Portal WWDR certificate is also needed.
            const wwdrContent = fs.existsSync(this.wwdrPath) ? fs.readFileSync(this.wwdrPath) : null;
            if (!wwdrContent) {
                throw new Error(`WWDR certificate not found at: ${this.wwdrPath}`);
            }

            // 1. Initialize PKPass
            const pass = new PKPass(
                {}, // No additional buffers initially
                {
                    wwdr: wwdrContent,
                    signerCert: fs.readFileSync(this.signerCertPath),
                    signerKey: fs.readFileSync(this.signerKeyPath),
                    signerKeyPassphrase: this.p12Passphrase,
                },
                {
                    serialNumber: data.serialNumber,
                }
            );

            // 2. Explicitly set the pass type
            // This is the CRITICAL fix for "type is missing" error in v3.5.7
            pass.type = "storeCard";

            // 3. Set pass properties via .props object
            Object.assign(pass.props, {
                formatVersion: 1,
                passTypeIdentifier: this.passTypeId,
                teamIdentifier: this.teamId,
                organizationName: card.companyName || "Belbeda",
                description: card.cardDesc || "Loyalty Card",
                sharingProhibited: false,
                backgroundColor: card.cardBackground,
                labelColor: card.textColor,
                foregroundColor: card.textColor,
            });

            // 4. Set Barcodes
            pass.setBarcodes({
                format: "PKBarcodeFormatQR",
                message: data.customerId,
                messageEncoding: "iso-8859-1",
            });

            // 5. Set Fields
            // In v3.5.7, these are proxies to arrays. Pushing to them works.
            pass.primaryFields.push({
                key: "points",
                label: "POINTS",
                value: data.points || 0,
            });

            pass.secondaryFields.push({
                key: "customerName",
                label: "CUSTOMER",
                value: data.customerName || "Customer",
            });

            // 3. Add images (Mandatory: icon, Optional: logo)
            const addImageFromPath = async (filePath, passName) => {
                if (!filePath) return false;
                const absolutePath = path.resolve(process.cwd(), filePath);
                if (fs.existsSync(absolutePath)) {
                    const buffer = fs.readFileSync(absolutePath);
                    pass.addBuffer(`${passName}.png`, buffer);
                    pass.addBuffer(`${passName}@2x.png`, buffer);
                    pass.addBuffer(`${passName}@3x.png`, buffer);
                    return true;
                } else {
                    console.warn(`Apple Wallet: Image file not found at ${absolutePath} for ${passName}`);
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
