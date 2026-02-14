import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";
import { googleWalletService } from "../../../utils/googleWallet.service.js";

class CustomerCardService {
    /**
     * Get all cards for a specific business
     * @param {string} businessId 
     * @returns {Promise<Array>}
     */
    static async getCardsByBusiness(businessId, customerId = null) {
        const allCards = await prisma.card.findMany({
            where: {
                businessId,
                isActive: true,
                OR: [
                    { expiryDate: null },
                    { expiryDate: { gt: new Date() } }
                ]
            },
            orderBy: { createdAt: "desc" },
        });

        if (!customerId) return allCards;

        // Proactive Discovery: Check status for these cards and update tracker
        const cardsWithDiscovery = await Promise.all(allCards.map(async (card) => {
            let isAddedToWallet = false;
            try {
                // Check local tracker first for efficiency
                const existingWallet = await prisma.customerCardWallet.findUnique({
                    where: { customerId_cardId: { customerId, cardId: card.id } }
                });

                if (existingWallet) {
                    isAddedToWallet = existingWallet.isAddedToGoogleWallet || existingWallet.isAddedToAppleWallet;
                } else {
                    // Fallback to Google Wallet check (Discovery)
                    const walletObject = await googleWalletService.getLoyaltyObject(customerId, card.id);
                    isAddedToWallet = !!(walletObject && walletObject.state === 'ACTIVE');

                    // If discovered, save to tracker
                    if (isAddedToWallet) {
                        await prisma.customerCardWallet.create({
                            data: { customerId, cardId: card.id, isAddedToGoogleWallet: true }
                        }).catch(() => { });
                    }
                }
            } catch (error) {
                // Fail silently
            }

            return { ...card, isAddedToWallet };
        }));

        return cardsWithDiscovery;
    }

    /**
     * Get a single card by its ID
     * @param {string} id 
     * @returns {Promise<Object>}
     */
    static async getCardById(id) {
        const card = await prisma.card.findUnique({
            where: { id },
        });

        if (!card) {
            throw new AppError(404, "Card not found");
        }

        return card;
    }

    static async getMyCards(customerId) {
        // 1. Identify all businesses the customer has interacted with
        const rewardHistories = await prisma.rewardHistory.findMany({
            where: { customerId },
            select: { businessId: true }
        });
        const businessIds = [...new Set(rewardHistories.map(h => h.businessId))];

        if (businessIds.length === 0) return [];

        // 2. Fetch all active cards for these businesses
        const activeCards = await prisma.card.findMany({
            where: {
                businessId: { in: businessIds },
                isActive: true,
                OR: [
                    { expiryDate: null },
                    { expiryDate: { gt: new Date() } }
                ]
            },
            include: { business: true }
        });

        // 3. Proactive Discovery: Check status for these cards and update tracker
        await Promise.all(activeCards.map(async (card) => {
            try {
                // Check if we already have a record
                const existingWallet = await prisma.customerCardWallet.findUnique({
                    where: { customerId_cardId: { customerId, cardId: card.id } }
                });

                if (!existingWallet) {
                    // Try to discover from Google Wallet
                    const walletObject = await googleWalletService.getLoyaltyObject(customerId, card.id);
                    if (walletObject && walletObject.state === 'ACTIVE') {
                        await prisma.customerCardWallet.create({
                            data: {
                                customerId,
                                cardId: card.id,
                                isAddedToGoogleWallet: true
                            }
                        }).catch(() => { });
                    }
                }
            } catch (error) {
                // Fail silently
            }
        }));

        // 4. Fetch the final list of added wallets for this customer
        const addedWallets = await prisma.customerCardWallet.findMany({
            where: {
                customerId,
                OR: [
                    { isAddedToGoogleWallet: true },
                    { isAddedToAppleWallet: true }
                ]
            },
            include: {
                card: {
                    include: { business: true }
                }
            },
            orderBy: { lastSyncedAt: 'desc' }
        });

        // 5. Group by Business
        const businessMap = new Map();

        // Re-fetch points to ensure we have them for the grouping
        const latestRewardHistories = await prisma.rewardHistory.findMany({
            where: {
                customerId,
                businessId: { in: [...new Set(addedWallets.map(w => w.card.businessId))] }
            }
        });

        for (const wallet of addedWallets) {
            const card = wallet.card;
            const business = card.business;
            const businessId = business.id;

            if (!businessMap.has(businessId)) {
                // Find points for this business (sum across branches if applicable)
                const histories = latestRewardHistories.filter(h => h.businessId === businessId);
                const totalPoints = histories.reduce((sum, h) => sum + (h.rewardPoints || 0), 0);

                businessMap.set(businessId, {
                    businessId: businessId,
                    businessName: business.name,
                    points: totalPoints,
                    cards: []
                });
            }

            businessMap.get(businessId).cards.push({
                ...card,
                isAddedToGoogleWallet: wallet.isAddedToGoogleWallet,
                isAddedToAppleWallet: wallet.isAddedToAppleWallet,
                isAddedToWallet: true
            });
        }

        return Array.from(businessMap.values());
    }
}

export default CustomerCardService;
