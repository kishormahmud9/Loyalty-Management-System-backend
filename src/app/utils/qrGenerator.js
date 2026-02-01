import QRCode from "qrcode";
import crypto from "crypto";

import fs from "fs";
import path from "path";

/**
 * Generates a unique 6-digit code.
 * @returns {string} 6-digit numeric string.
 */
export const generateSixDigitCode = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generates a Data URL for a QR code based on the provided text.
 * @param {string} text - The text to encode in the QR code.
 * @returns {Promise<string>} Base64 encoded Data URL of the QR code image.
 */
export const generateQRCodeDataURL = async (text) => {
    try {
        const qrCodeDataURL = await QRCode.toDataURL(text);
        return qrCodeDataURL;
    } catch (error) {
        console.error("QR Code generation error:", error);
        throw new Error("Failed to generate QR code");
    }
};

/**
 * Generates a QR code and saves it as a PNG file.
 * @param {string} text - The text to encode in the QR code.
 * @param {string} filename - The name of the file to save.
 * @param {string} uploadDir - Optional. The directory to save the file in (default: uploads/qrcodes/).
 * @returns {Promise<string>} Relative path to the saved QR code image.
 */
export const generateAndSaveQRCode = async (text, filename, uploadDir = "uploads/qrcodes/") => {
    // Ensure the directory ends with a slash
    if (!uploadDir.endsWith("/")) {
        uploadDir += "/";
    }

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, `${filename}.png`);
    const relativePath = `${uploadDir}${filename}.png`;

    try {
        await QRCode.toFile(filePath, text);
        return relativePath;
    } catch (error) {
        console.error("Failed to save QR code image:", error);
        throw new Error("Failed to generate and save QR code");
    }
};
