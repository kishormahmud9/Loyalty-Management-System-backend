import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";
import { googleWalletService } from "../../../utils/googleWallet.service.js";
import { appleWalletService } from "./appleWallet.service.js";

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

    static async getAppleWalletPass(customerId, cardId) {
        // 1. Find the card
        const card = await prisma.card.findUnique({
            where: { id: cardId },
        });

        if (!card) {
            throw new AppError(404, "Loyalty card not found");
        }

        // 2. Get customer info and points
        const customer = await prisma.customer.findUnique({
            where: { id: customerId }
        });

        const rewardHistory = await prisma.rewardHistory.findFirst({
            where: {
                customerId,
                businessId: card.businessId
            }
        });

        const data = {
            serialNumber: `${customerId}_${card.id}`,
            customerId: customer.id,
            customerName: customer.name,
            points: rewardHistory ? rewardHistory.rewardPoints : 0
        };

        // 3. Generate Pass
        const buffer = await appleWalletService.generatePass(data, card);

        // 4. Update tracker
        await prisma.customerCardWallet.upsert({
            where: { customerId_cardId: { customerId, cardId: card.id } },
            update: { lastSyncedAt: new Date(), isAddedToAppleWallet: true },
            create: { customerId, cardId: card.id, isAddedToAppleWallet: true }
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
}

export default CustomerWalletService;
