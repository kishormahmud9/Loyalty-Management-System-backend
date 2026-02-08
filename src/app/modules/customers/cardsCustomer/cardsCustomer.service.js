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
        // This ensures cards added before tracking was implemented are "discovered"
        const cardsWithDiscovery = await Promise.all(allCards.map(async (card) => {
            let isAddedToWallet = false;
            try {
                const walletObject = await googleWalletService.getLoyaltyObject(customerId, card.id);
                isAddedToWallet = !!(walletObject && walletObject.state === 'ACTIVE');
            } catch (error) {
                // Fail silently
            }

            // Update tracker
            await prisma.customerCardWallet.upsert({
                where: { customerId_cardId: { customerId, cardId: card.id } },
                update: { isAddedToGoogleWallet: isAddedToWallet, lastSyncedAt: new Date() },
                create: { customerId, cardId: card.id, isAddedToGoogleWallet: isAddedToWallet }
            }).catch(() => { });

            return { ...card, isAddedToWallet };
        }));

        // Now filter out the ones already added for the "Business Card List" 
        // as the user wants to see only NOT added cards here.
        return cardsWithDiscovery.filter(card => !card.isAddedToWallet);
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
        // 1. Fetch all cards that have been flagged as added to either Google or Apple Wallet
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
                    include: {
                        business: true
                    }
                }
            },
            orderBy: { lastSyncedAt: 'desc' }
        });

        if (addedWallets.length === 0) return [];

        // 2. Fetch Reward History effectively for these businesses
        const uniqueBusinessIds = [...new Set(addedWallets.map(w => w.card.businessId))];
        const rewardHistories = await prisma.rewardHistory.findMany({
            where: {
                customerId,
                businessId: { in: uniqueBusinessIds }
            }
        });

        // 3. Group everything by Business
        const businessMap = new Map();

        for (const wallet of addedWallets) {
            const card = wallet.card;
            const business = card.business;
            const businessId = business.id;

            if (!businessMap.has(businessId)) {
                // Find points for this business
                const history = rewardHistories.find(h => h.businessId === businessId);
                
                businessMap.set(businessId, {
                    businessId: businessId,
                    businessName: business.name,
                    points: history ? history.rewardPoints : 0,
                    cards: []
                });
            }

            businessMap.get(businessId).cards.push({
                ...card,
                isAddedToGoogleWallet: wallet.isAddedToGoogleWallet,
                isAddedToAppleWallet: wallet.isAddedToAppleWallet,
                isAddedToWallet: true // Explicit flag for UI/unified check
            });
        }

        return Array.from(businessMap.values());
    }
}

export default CustomerCardService;
