import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";
import { googleWalletService } from "../../../utils/googleWallet.service.js";
import { appleWalletService } from "./appleWallet.service.js";
import { envVars } from "../../../config/env.js";

class CustomerWalletService {
    static async getGoogleWalletLink(customerId, cardId) {
        // 1. Verify card exists
        const card = await prisma.card.findUnique({
            where: { id: cardId }
        });

        if (!card) {
            throw new AppError(404, "Card not found");
        }

        // 2. Get customer's current points for this business/card
        const rewardHistory = await prisma.rewardHistory.findFirst({
            where: {
                customerId,
                businessId: card.businessId
            }
        });

        const currentPoints = rewardHistory ? rewardHistory.rewardPoints : 0;

        // 3. Ensure the Loyalty Class exists
        await googleWalletService.createOrUpdateClass(card);

        // 4. Generate Link
        const link = googleWalletService.createSaveLink(customerId, cardId, currentPoints);

        // 5. Register intent in our tracker
        await prisma.customerCardWallet.upsert({
            where: { customerId_cardId: { customerId, cardId } },
            update: { lastSyncedAt: new Date(), isAddedToGoogleWallet: true },
            create: { customerId, cardId, isAddedToGoogleWallet: true }
        }).catch(err => console.error("Failed to register wallet intent:", err));

        return { link };
    }

    static async getAppleWalletLink(customerId, cardId) {
        // 1. Verify card exists
        const card = await prisma.card.findUnique({
            where: { id: cardId }
        });

        if (!card) {
            throw new AppError(404, "Card not found");
        }

        // 2. Ensure CustomerCardWallet record exists (to get a unique public ID)
        const wallet = await prisma.customerCardWallet.upsert({
            where: { customerId_cardId: { customerId, cardId } },
            update: {},
            create: { customerId, cardId }
        });

        // 3. Generate absolute URL (No token needed anymore!)
        const passUrl = `${envVars.SERVER_URL}/api/customer/wallet/apple-wallet-pass/${wallet.id}`;

        return { link: passUrl };
    }

    static async getAppleWalletPass(walletId) {
        // 1. Find the wallet record (Public access via unique UUID)
        const wallet = await prisma.customerCardWallet.findUnique({
            where: { id: walletId },
            include: { card: true, customer: true }
        });

        if (!wallet) {
            throw new AppError(404, "Wallet record not found");
        }

        const { customer, card } = wallet;

        // 2. Get customer's current points
        const rewardHistory = await prisma.rewardHistory.findFirst({
            where: {
                customerId: customer.id,
                businessId: card.businessId
            }
        });

        const data = {
            serialNumber: `${customer.id}_${card.id}`,
            customerId: customer.id,
            customerName: customer.name,
            points: rewardHistory ? rewardHistory.rewardPoints : 0
        };

        // 3. Generate Pass
        const buffer = await appleWalletService.generatePass(data, card);

        // 4. Update tracker
        await prisma.customerCardWallet.update({
            where: { id: walletId },
            data: { lastSyncedAt: new Date(), isAddedToAppleWallet: true }
        }).catch(err => console.error("Failed to update Apple Wallet status:", err));

        return {
            buffer,
            filename: `${card.companyName.replace(/\s+/g, '_')}_Loyalty.pkpass`
        };
    }

    static async getWalletHistory(customerId) {
        // Get all wallet records with card and business info
        const cardWallets = await prisma.customerCardWallet.findMany({
            where: { customerId },
            include: {
                card: {
                    include: {
                        business: true
                    }
                }
            },
            orderBy: { lastSyncedAt: 'desc' }
        });

        // Group by business
        const history = cardWallets.reduce((acc, wallet) => {
            const businessId = wallet.card.businessId;
            if (!acc[businessId]) {
                acc[businessId] = {
                    businessId: businessId,
                    businessName: wallet.card.business.name,
                    cards: []
                };
            }

            acc[businessId].cards.push({
                cardId: wallet.cardId,
                cardDesc: wallet.card.cardDesc,
                isAddedToGoogleWallet: wallet.isAddedToGoogleWallet,
                isAddedToAppleWallet: wallet.isAddedToAppleWallet,
                lastSyncedAt: wallet.lastSyncedAt
            });

            return acc;
        }, {});

        return Object.values(history);
    }

    static async getMyWallets(customerId) {
        return prisma.customerCardWallet.findMany({
            where: {
                customerId,
                OR: [
                    { isAddedToGoogleWallet: true },
                    { isAddedToAppleWallet: true }
                ]
            },
            include: {
                card: {
                    include: {
                        business: true
                    }
                }
            },
            orderBy: { lastSyncedAt: 'desc' }
        });
    }
}

export default CustomerWalletService;
