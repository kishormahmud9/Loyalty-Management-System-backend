import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";
import { googleWalletService } from "../../../utils/googleWallet.service.js";

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
        // This system ties points to branches, but Google Wallet usually tracks per-business loyalty.
        // We'll take the sum or a specific branch's points. Let's look for the record.
        const rewardHistory = await prisma.rewardHistory.findFirst({
            where: {
                customerId,
                businessId: card.businessId
            }
        });

        const currentPoints = rewardHistory ? rewardHistory.rewardPoints : 0;

        // 3. Ensure the Loyalty Class exists (in case it wasn't synced during creation)
        await googleWalletService.createOrUpdateClass(card);

        // 4. Generate Link
        const link = googleWalletService.createSaveLink(customerId, cardId, currentPoints);

        // 5. Register intent in our tracker (so it shows up in "My Cards" for status checking)
        await prisma.customerCardWallet.upsert({
            where: { customerId_cardId: { customerId, cardId } },
            update: { lastSyncedAt: new Date() },
            create: { customerId, cardId, isAddedToGoogleWallet: false }
        }).catch(err => console.error("Failed to register wallet intent:", err));

        return { link };
    }
}

export default CustomerWalletService;
