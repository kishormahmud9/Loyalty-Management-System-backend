-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "CustomerCardWallet" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "isAddedToGoogleWallet" BOOLEAN NOT NULL DEFAULT false,
    "isAddedToAppleWallet" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerCardWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerCardWallet_customerId_idx" ON "CustomerCardWallet"("customerId");

-- CreateIndex
CREATE INDEX "CustomerCardWallet_cardId_idx" ON "CustomerCardWallet"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerCardWallet_customerId_cardId_key" ON "CustomerCardWallet"("customerId", "cardId");

-- AddForeignKey
ALTER TABLE "CustomerCardWallet" ADD CONSTRAINT "CustomerCardWallet_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCardWallet" ADD CONSTRAINT "CustomerCardWallet_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
