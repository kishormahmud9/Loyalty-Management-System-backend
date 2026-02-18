import { v4 as uuidv4 } from "uuid";
import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";
import { googleWalletService } from "../../../utils/googleWallet.service.js";
import { appleWalletService } from "./appleWallet.service.js";
import { apnsService } from "../../../utils/apns.service.js";
import { envVars } from "../../../config/env.js";

class CustomerWalletService {
  static async getGoogleWalletLink(customerId, cardId) {
    // 1. Verify card exists
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new AppError(404, "Card not found");
    }

    // 2. Get customer's current points for this business/card
    const rewardHistory = await prisma.rewardHistory.findFirst({
      where: {
        customerId,
        businessId: card.businessId,
      },
    });

    const currentPoints = rewardHistory ? rewardHistory.rewardPoints : 0;

    // 3. Ensure the Loyalty Class exists
    await googleWalletService.createOrUpdateClass(card);

    // 4. Generate Link
    const link = googleWalletService.createSaveLink(
      customerId,
      cardId,
      currentPoints,
    );

    return { link };
  }

  static async getAppleWalletLink(customerId, cardId) {
    // 1. Verify card exists
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new AppError(404, "Card not found");
    }

    console.log(
      `[AppleWalletLink] Found card: ${card.id} for business: ${card.businessId}`,
    );

    // 2. Generate absolute URL using customerId and cardId
    const passUrl = `${envVars.SERVER_URL}/api/customer/wallet/apple-wallet-pass/${customerId}/${cardId}`;
    console.log(`[AppleWalletLink] Generated pass URL: ${passUrl}`);
    const applePass = await prisma.applePass.findUnique({
      where: { serialNumber: `${customerId}_${card.id}` },
    });

    console.log(
      `[AppleWalletLink] Serial: ${customerId}_${card.id}, Found Pass: ${!!applePass}, Token: ${applePass?.authenticationToken}`,
    );

    return {
      downloadLink: passUrl,
      authenticationToken: applePass ? applePass.authenticationToken : null,
    };
  }

  static async getAppleWalletPass(customerId, cardId) {
    // 1. Find the card and customer
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    let customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    // If not found by ID, try finding by qrCode
    if (!customer) {
      customer = await prisma.customer.findUnique({
        where: { qrCode: customerId },
      });
    }

    if (!card) {
      throw new AppError(404, "Apple Wallet Card not found");
    }

    if (!customer) {
      throw new AppError(404, "Customer not found");
    }

    // 2. Get customer's current points
    const rewardHistory = await prisma.rewardHistory.findFirst({
      where: {
        customerId: customer.id,
        businessId: card.businessId,
      },
    });

    const serialNumber = `${customer.id}_${card.id}`;

    // 3. Upsert ApplePass record to store authenticationToken
    const applePass = await prisma.applePass.upsert({
      where: { serialNumber },
      update: { lastUpdated: new Date() },
      create: {
        serialNumber,
        passTypeIdentifier: envVars.APPLE_WALLET.PASS_TYPE_ID,
        authenticationToken: uuidv4().replace(/-/g, ""),
      },
    });

    console.log(
      `[AppleWalletPass] Upserted Pass for serial: ${serialNumber}, Token: ${applePass.authenticationToken}`,
    );

    const data = {
      serialNumber,
      customerId: customer.id,
      customerName: customer.name,
      points: rewardHistory ? rewardHistory.rewardPoints : 0,
      authenticationToken: applePass.authenticationToken,
    };

    // 4. Generate Pass
    const buffer = await appleWalletService.generatePass(data, card);

    return {
      buffer,
      filename: `${card.companyName.replace(/\s+/g, "_")}_Loyalty.pkpass`,
      authenticationToken: applePass.authenticationToken,
    };
  }

  /**
   * Trigger Apple Wallet push notification for a specific customer and card (business)
   * @param {string} customerId
   * @param {string} businessId
   */
  static async handleApplePassUpdate(customerId, businessId) {
    try {
      // 1. Find the card for this business
      const card = await prisma.card.findFirst({
        where: { businessId, isActive: true },
      });

      if (!card) return;

      const serialNumber = `${customerId}_${card.id}`;

      // 2. Update the pass record timestamp
      await prisma.applePass.update({
        where: { serialNumber },
        data: { lastUpdated: new Date() },
      });

      // 3. Find all device registrations for this pass
      const registrations = await prisma.appleRegistration.findMany({
        where: { serialNumber },
        include: { device: true },
      });

      // 4. Send push to each registered device
      const pushPromises = registrations.map((reg) =>
        apnsService.sendPassUpdatePush(reg.device.pushToken),
      );

      await Promise.all(pushPromises);
    } catch (error) {
      console.error("Error triggering Apple Wallet pass update push:", error);
    }
  }

  static async saveCard(customerId, cardId) {
    // 1. Verify card exists
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new AppError(404, "Card not found");
    }

    // 2. Upsert the wallet record and mark as added
    return prisma.customerCardWallet.upsert({
      where: { customerId_cardId: { customerId, cardId } },
      update: {
        lastSyncedAt: new Date(),
        isAddedToGoogleWallet: true,
        isAddedToAppleWallet: true,
      },
      create: {
        customerId,
        cardId,
        isAddedToGoogleWallet: true,
        isAddedToAppleWallet: true,
      },
    });
  }

  static async getWalletHistory(customerId) {
    // 1. Identify all businesses the customer has interacted with
    const rewardHistories = await prisma.rewardHistory.findMany({
      where: { customerId },
      select: { businessId: true },
    });
    const businessIds = [...new Set(rewardHistories.map((h) => h.businessId))];

    if (businessIds.length > 0) {
      // 2. Fetch all active cards for these businesses
      const activeCards = await prisma.card.findMany({
        where: {
          businessId: { in: businessIds },
          isActive: true,
          OR: [{ expiryDate: null }, { expiryDate: { gt: new Date() } }],
        },
      });

      // 3. Proactive Discovery: Check status for these cards and update tracker
      await Promise.all(
        activeCards.map(async (card) => {
          try {
            const existingWallet = await prisma.customerCardWallet.findUnique({
              where: { customerId_cardId: { customerId, cardId: card.id } },
            });

            if (!existingWallet) {
              const walletObject = await googleWalletService.getLoyaltyObject(
                customerId,
                card.id,
              );
              if (walletObject && walletObject.state === "ACTIVE") {
                await prisma.customerCardWallet
                  .create({
                    data: {
                      customerId,
                      cardId: card.id,
                      isAddedToGoogleWallet: true,
                    },
                  })
                  .catch(() => {});
              }
            }
          } catch (error) {
            // Fail silently
          }
        }),
      );
    }

    // 4. Get all wallet records with card and business info
    const cardWallets = await prisma.customerCardWallet.findMany({
      where: { customerId },
      include: {
        card: {
          include: {
            business: true,
          },
        },
      },
      orderBy: { lastSyncedAt: "desc" },
    });

    // Group by business
    const history = cardWallets.reduce((acc, wallet) => {
      const businessId = wallet.card.businessId;
      if (!acc[businessId]) {
        acc[businessId] = {
          businessId: businessId,
          businessName: wallet.card.business.name,
          cards: [],
        };
      }

      acc[businessId].cards.push({
        cardId: wallet.cardId,
        cardDesc: wallet.card.cardDesc,
        isAddedToGoogleWallet: wallet.isAddedToGoogleWallet,
        isAddedToAppleWallet: wallet.isAddedToAppleWallet,
        lastSyncedAt: wallet.lastSyncedAt,
      });

      return acc;
    }, {});

    return Object.values(history);
  }

  static async getMyWallets(customerId, businessId) {
    // 1. Identify all businesses the customer has interacted with
    const rewardHistories = await prisma.rewardHistory.findMany({
      where: { customerId },
      select: { businessId: true },
    });
    const businessIds = [...new Set(rewardHistories.map((h) => h.businessId))];

    if (businessIds.length === 0) return [];

    // 2. Fetch all active cards for these businesses
    const activeCards = await prisma.card.findMany({
      where: {
        businessId: { in: businessIds },
        isActive: true,
        OR: [{ expiryDate: null }, { expiryDate: { gt: new Date() } }],
      },
    });

    // 3. Proactive Discovery: Check status for these cards and update tracker
    await Promise.all(
      activeCards.map(async (card) => {
        try {
          const existingWallet = await prisma.customerCardWallet.findUnique({
            where: { customerId_cardId: { customerId, cardId: card.id } },
          });

          if (!existingWallet) {
            const walletObject = await googleWalletService.getLoyaltyObject(
              customerId,
              card.id,
            );
            if (walletObject && walletObject.state === "ACTIVE") {
              await prisma.customerCardWallet
                .create({
                  data: {
                    customerId,
                    cardId: card.id,
                    isAddedToGoogleWallet: true,
                  },
                })
                .catch(() => {});
            }
          }
        } catch (error) {
          // Fail silently
        }
      }),
    );

    // 4. Return the final flat list
    return prisma.customerCardWallet.findMany({
      where: {
        customerId,
        card: {
          businessId: businessId, // Filter by businessId
        },
        OR: [{ isAddedToGoogleWallet: true }, { isAddedToAppleWallet: true }],
      },
      include: {
        card: {
          include: { business: true },
        },
      },
      orderBy: { lastSyncedAt: "desc" },
    });
  }
}

export default CustomerWalletService;
