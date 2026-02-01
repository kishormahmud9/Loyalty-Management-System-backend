import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GoogleWalletService {
    constructor() {
        this.issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
        this.keyFilePath = path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS || 'service-account.json');

        if (!fs.existsSync(this.keyFilePath)) {
            console.error(`Google Wallet key file not found at: ${this.keyFilePath}`);
        } else {
            this.credentials = JSON.parse(fs.readFileSync(this.keyFilePath, 'utf8'));
            this.auth();
        }
    }

    auth() {
        const auth = new google.auth.GoogleAuth({
            keyFile: this.keyFilePath,
            scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
        });

        this.client = google.walletobjects({
            version: 'v1',
            auth: auth,
        });
    }

    /**
     * Create or Update a Loyalty Class (Card Template)
     */
    async createOrUpdateClass(card) {
        const classId = `${this.issuerId}.loyalty`;
        const serverUrl = (process.env.SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');

        // Helper to validate and construct absolute URLs
        const getUrl = (path) => {
            if (!path || typeof path !== 'string') return undefined;
            // If it's already a full URL
            if (path.startsWith('http')) return path;
            // If it looks like a hex code or color (doesn't have a dot for file extension)
            if (!path.includes('.')) return undefined;
            // Prepend server URL and fix slashes
            return `${serverUrl}/${path.replace(/\\/g, '/').replace(/^\//, '')}`;
        };

        const logoUrl = getUrl(card.logo) || 'https://i.ibb.co.com/fdYvwtg1/image.png';
        const backgroundUrl = getUrl(card.cardBackground);

        // Google Wallet requires absolute URIs from a public domain.
        // If we are on localhost, Google will reject these. We log a warning but continue.
        if (serverUrl.includes('localhost')) {
            console.warn("⚠️ Google Wallet: Using 'localhost' for images. Google servers will not be able to load these images.");
        }

        const loyaltyClass = {
            id: classId,
            issuerName: (card.companyName || 'Belbedia Loyalty').substring(0, 20), // Google has limits
            reviewStatus: 'UNDER_REVIEW',
            programName: (card.cardDesc || 'Loyalty Program').substring(0, 20),
            programLogo: {
                sourceUri: { uri: logoUrl.includes('localhost') ? 'https://i.ibb.co.com/fdYvwtg1/image.png' : logoUrl },
                contentDescription: {
                    defaultValue: { language: 'en-US', value: 'Program Logo' }
                }
            },
            heroImage: backgroundUrl && !backgroundUrl.includes('localhost') ? {
                sourceUri: { uri: backgroundUrl },
                contentDescription: {
                    defaultValue: { language: 'en-US', value: 'Hero Image' }
                }
            } : undefined
        };

        try {
            // Check if exists
            await this.client.loyaltyclass.get({ resourceId: classId });
            // Update
            const response = await this.client.loyaltyclass.patch({
                resourceId: classId,
                requestBody: loyaltyClass
            });
            return response.data;
        } catch (err) {
            console.error("Google Wallet API Error:", err.response?.data || err.message);
            if (err.response && err.response.status === 404) {
                // Insert
                try {
                    const response = await this.client.loyaltyclass.insert({
                        requestBody: loyaltyClass
                    });
                    return response.data;
                } catch (insertErr) {
                    console.error("Google Wallet Insert Error:", insertErr.response?.data || insertErr.message);
                    throw insertErr;
                }
            }
            throw err;
        }
    }

    /**
     * Generate the "Add to Google Wallet" Link (JWT)
     */
    createSaveLink(customerId, cardId, currentPoints = 0) {
        const objectId = `${this.issuerId}.${customerId}_${cardId}`;
        const classId = `${this.issuerId}.loyalty`;

        const loyaltyObject = {
            id: objectId,
            classId: classId,
            state: 'ACTIVE',
            barcode: {
                type: 'QR_CODE',
                value: customerId // Use customer ID as barcode value
            },
            accountId: customerId,
            accountName: 'Customer', // You can update this with actual customer name
            loyaltyPoints: {
                label: 'Points',
                balance: {
                    int: currentPoints
                }
            }
        };

        const claims = {
            iss: this.credentials.client_email,
            aud: 'google',
            origins: [process.env.FRONT_END_URL || 'http://localhost:3000'],
            typ: 'savetowallet',
            payload: {
                loyaltyObjects: [loyaltyObject]
            }
        };

        const token = jwt.sign(claims, this.credentials.private_key, { algorithm: 'RS256' });
        return `https://pay.google.com/gp/v/save/${token}`;
    }

    /**
     * Update points on an existing Wallet Object
     */
    async updatePoints(customerId, cardId, points) {
        const objectId = `${this.issuerId}.${customerId}_${cardId}`;

        const patchBody = {
            loyaltyPoints: {
                balance: {
                    int: points
                }
            }
        };

        try {
            const response = await this.client.loyaltyobject.patch({
                resourceId: objectId,
                requestBody: patchBody
            });
            return response.data;
        } catch (err) {
            if (err.response && err.response.status === 404) {
                // Object doesn't exist yet, customer hasn't added it to wallet
                return null;
            }
            throw err;
        }
    }

    /**
     * Get an existing Loyalty Object
     */
    async getLoyaltyObject(customerId, cardId) {
        const objectId = `${this.issuerId}.${customerId}_${cardId}`;

        try {
            const response = await this.client.loyaltyobject.get({
                resourceId: objectId
            });
            return response.data;
        } catch (err) {
            if (err.response && err.response.status === 404) {
                return null;
            }
            throw err;
        }
    }
}

export const googleWalletService = new GoogleWalletService();
