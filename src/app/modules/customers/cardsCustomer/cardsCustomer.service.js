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

    static async getMyCards(customerId, businessId = null) {
        let activeBranchId = null;

        // 1. Resolve businessId if not provided
        if (!businessId) {
            const customer = await prisma.customer.findUnique({
                where: { id: customerId },
                select: { activeBranchId: true }
            });

            if (!customer?.activeBranchId) {
                return [];
            }

            activeBranchId = customer.activeBranchId;

            const activeBranch = await prisma.branch.findUnique({
                where: { id: activeBranchId },
                select: { businessId: true }
            });

            if (!activeBranch) {
                return [];
            }

            businessId = activeBranch.businessId;
        }

        // 2. Fetch all cards for this business that the customer has added to their wallet
        const addedWallets = await prisma.customerCardWallet.findMany({
            where: {
                customerId,
                card: {
                    businessId: businessId
                },
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

        if (addedWallets.length === 0) {
            return [];
        }

        // 3. Fetch points for this customer in this business
        // If we have an active branch, prioritze branch-specific points.
        // Otherwise, sum points for all branches of this business for this customer.
        let points = 0;
        if (activeBranchId) {
            const rewardHistory = await prisma.rewardHistory.findUnique({
                where: {
                    customerId_branchId: {
                        customerId,
                        branchId: activeBranchId
                    }
                }
            });
            points = rewardHistory?.rewardPoints || 0;
        } else {
            const rewardHistories = await prisma.rewardHistory.findMany({
                where: {
                    customerId,
                    businessId
                }
            });
            points = rewardHistories.reduce((sum, h) => sum + (h.rewardPoints || 0), 0);
        }

        const businessData = addedWallets[0].card.business;

        // 4. Construct the response
        return [
            {
                businessId: businessId,
                businessName: businessData.name,
                points: points,
                cards: addedWallets.map(wallet => ({
                    ...wallet.card,
                    isAddedToGoogleWallet: wallet.isAddedToGoogleWallet,
                    isAddedToAppleWallet: wallet.isAddedToAppleWallet,
                    isAddedToWallet: true
                }))
            }
        ];
    }
}

export default CustomerCardService;
