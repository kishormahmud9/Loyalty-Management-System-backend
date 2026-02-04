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
        // 1. Fetch data from 3 sources to find ALL potential businesses/cards
        const [history, trackedWallets, branchData] = await Promise.all([
            prisma.rewardHistory.findMany({
                where: { customerId },
                include: { business: { include: { cards: true } } }
            }),
            prisma.customerCardWallet.findMany({
                where: { customerId },
                include: { card: { include: { business: true } } }
            }),
            prisma.customerBranchData.findMany({
                where: { customerId },
                include: { business: { include: { cards: true } } }
            })
        ]);

        console.log(`[DEBUG] getMyCards for customerId: ${customerId}`);
        console.log(`[DEBUG] history count: ${history.length}`);
        console.log(`[DEBUG] trackedWallets count: ${trackedWallets.length}`);
        console.log(`[DEBUG] branchData count: ${branchData.length}`);

        // 2. Group by businessId to sum points and gather unique cards
        const businessMap = new Map();

        // Process tracked wallets (explicit intent)
        for (const tw of trackedWallets) {
            if (!tw.card) continue;
            const bizId = tw.card.businessId;
            if (!businessMap.has(bizId)) {
                businessMap.set(bizId, {
                    businessName: tw.card.business?.name || "Unknown Business",
                    businessId: bizId,
                    totalPoints: 0,
                    cardsMap: new Map()
                });
            }
            const isExpired = tw.card.expiryDate && new Date(tw.card.expiryDate) < new Date();
            if (tw.card.isActive && !isExpired) {
                businessMap.get(bizId).cardsMap.set(tw.card.id, tw.card);
            }
        }

        // Process branch registrations (registered but maybe no points yet)
        for (const bd of branchData) {
            const bizId = bd.businessId;
            if (!businessMap.has(bizId)) {
                businessMap.set(bizId, {
                    businessName: bd.business.name,
                    businessId: bizId,
                    totalPoints: 0,
                    cardsMap: new Map()
                });
            }
            // Add all active cards of this business as potential checks
            bd.business.cards.forEach(card => {
                const isExpired = card.expiryDate && new Date(card.expiryDate) < new Date();
                if (card.isActive && !isExpired) {
                    businessMap.get(bizId).cardsMap.set(card.id, card);
                }
            });
        }

        // Process history and sum points
        for (const h of history) {
            const bizId = h.businessId;
            if (!businessMap.has(bizId)) {
                businessMap.set(bizId, {
                    businessName: h.business.name,
                    businessId: bizId,
                    totalPoints: 0,
                    cardsMap: new Map()
                });
            }
            // Ensure cards are in the map
            h.business.cards.forEach(card => {
                const isExpired = card.expiryDate && new Date(card.expiryDate) < new Date();
                if (card.isActive && !isExpired) {
                    businessMap.get(bizId).cardsMap.set(card.id, card);
                }
            });
            businessMap.get(bizId).totalPoints += h.rewardPoints;
        }

        // 4. Process results and check Google Wallet status for each unique card
        const result = await Promise.all(Array.from(businessMap.values()).map(async (biz) => {
            const uniqueCards = Array.from(biz.cardsMap.values());

            const cardsWithStatus = await Promise.all(uniqueCards.map(async (card) => {
                let isAddedToWallet = false;
                const objectId = `${googleWalletService.issuerId}.${customerId}_${card.id}`;
                console.log(`[DEBUG] Checking Wallet for cardId: ${card.id}, objectId: ${objectId}`);
                try {
                    const walletObject = await googleWalletService.getLoyaltyObject(customerId, card.id);
                    isAddedToWallet = !!(walletObject && walletObject.state === 'ACTIVE');
                    console.log(`[DEBUG] Wallet check result for ${card.id}: isAddedToWallet=${isAddedToWallet}, state=${walletObject?.state}`);
                } catch (error) {
                    console.error(`[DEBUG] Wallet check error for ${card.id}:`, error.message);
                }

                // Update tracker in the database
                await prisma.customerCardWallet.upsert({
                    where: { customerId_cardId: { customerId, cardId: card.id } },
                    update: { isAddedToGoogleWallet: isAddedToWallet, lastSyncedAt: new Date() },
                    create: { customerId, cardId: card.id, isAddedToGoogleWallet: isAddedToWallet }
                }).catch(err => console.error("Failed to update wallet tracker:", err));

                return {
                    ...card,
                    isAddedToWallet
                };
            }));

            // Filter to show ONLY added cards
            const addedCards = cardsWithStatus.filter(c => c.isAddedToWallet);

            return {
                businessName: biz.businessName,
                businessId: biz.businessId,
                points: biz.totalPoints,
                cards: addedCards
            };
        }));

        // Only return businesses that have at least one card added to wallet
        return result.filter(biz => biz.cards.length > 0);
    }
}

export default CustomerCardService;
