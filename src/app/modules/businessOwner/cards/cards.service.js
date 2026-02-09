import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";
import { auditLog } from "../../../utils/auditLogger.js";
import { googleWalletService } from "../../../utils/googleWallet.service.js";

class CardService {
    /* 
         CREATE CARD
       */
    static async createCard(data) {
        const {
            businessId,
            cardType,
            cardDesc,
            companyName,
            rewardProgram,
            stampsCount,
            earnRuleType,
            earnValue,
            earnUnit,
            barcodeType,
            logo,
            cardBackground,
            stampBackground,
            activeStamp,
            inactiveStamp,
            textColor,
            earnedRewardMessage,
            userId,
        } = data;

        // 🔐 REQUIRED FIELDS
        if (!businessId) throw new AppError(400, "businessId is required");
        if (!userId) throw new AppError(401, "userId is required");

        // 🔐 LIMIT VALIDATION: Only 2 active cards allowed at a time
        const activeCardsCount = await prisma.card.count({
            where: {
                businessId,
                isActive: true,
                OR: [
                    { expiryDate: null },
                    { expiryDate: { gt: new Date() } }
                ]
            }
        });

        if (activeCardsCount >= 2) {
            throw new AppError(400, "You have reached the maximum limit of 2 active cards. Please delete or deactivate an existing card before creating a new one.");
        }

        // ✅ CREATE CARD
        const card = await prisma.card.create({
            data: {
                businessId,
                cardType,
                cardDesc,
                companyName,
                rewardProgram,
                stampsCount: stampsCount ? Number(stampsCount) : 0,
                earnRuleType,
                earnValue: earnValue ? Number(earnValue) : undefined,
                earnUnit: earnUnit ? Number(earnUnit) : undefined,
                barcodeType,
                logo,
                logoFilePath: data.logoFilePath,
                cardBackground,
                stampBackground,
                stampBackgroundPath: data.stampBackgroundPath,
                activeStamp,
                inactiveStamp,
                textColor,
                earnedRewardMessage,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
                isActive: data.isActive !== undefined ? data.isActive : true,
            },
        });

        // 🔐 AUTO AUDIT LOG
        auditLog({
            userId,
            businessId,
            action: `Created new card for ${companyName}`,
            actionType: "CREATE",
            metadata: {
                cardId: card.id,
                companyName,
                cardType,
            },
        });

        // 🔐 SYNCHRONIZE WITH GOOGLE WALLET
        try {
            await googleWalletService.createOrUpdateClass(card);
        } catch (error) {
            console.error("Failed to sync card with Google Wallet:", error);
        }

        return card;
    }

    /* 
         GET ALL CARDS BY BUSINESS
       */
    static async getCardsByBusiness(businessId) {
        return prisma.card.findMany({
            where: { businessId },
            orderBy: { createdAt: "desc" },
        });
    }

    /* 
         GET CARD BY ID
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

    /* 
         UPDATE CARD
       */
    static async updateCard(id, data) {
        const { userId, ...updateData } = data;

        // 🔢 NUMBER CONVERSIONS
        if (updateData.stampsCount !== undefined)
            updateData.stampsCount = Number(updateData.stampsCount);
        if (updateData.earnValue !== undefined)
            updateData.earnValue = Number(updateData.earnValue);
        if (updateData.earnUnit !== undefined)
            updateData.earnUnit = Number(updateData.earnUnit);

        if (updateData.expiryDate !== undefined)
            updateData.expiryDate = updateData.expiryDate ? new Date(updateData.expiryDate) : null;

        const card = await prisma.card.update({
            where: { id },
            data: updateData,
        });

        // 🔐 AUTO AUDIT LOG
        auditLog({
            userId,
            businessId: card.businessId,
            action: `Updated card for ${card.companyName}`,
            actionType: "UPDATE",
            metadata: {
                cardId: card.id,
            },
        });

        // 🔐 SYNCHRONIZE WITH GOOGLE WALLET
        try {
            await googleWalletService.createOrUpdateClass(card);
        } catch (error) {
            console.error("Failed to sync card with Google Wallet:", error);
        }

        return card;
    }

    /* 
         DELETE CARD
       */
    static async deleteCard(id, userId) {
        const card = await prisma.card.delete({
            where: { id },
        });

        // 🔐 AUTO AUDIT LOG
        auditLog({
            userId,
            businessId: card.businessId,
            action: `Deleted card for ${card.companyName}`,
            actionType: "DELETE",
            metadata: {
                cardId: card.id,
            },
        });

        return card;
    }
}

export default CardService;
