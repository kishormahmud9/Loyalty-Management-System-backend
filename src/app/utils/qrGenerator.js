import QRCode from "qrcode";
import crypto from "crypto";

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
