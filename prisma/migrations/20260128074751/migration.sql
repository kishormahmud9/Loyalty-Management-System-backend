-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('stamp_card', 'reward_card');

-- CreateEnum
CREATE TYPE "BarcodeType" AS ENUM ('bar_code', 'qr_code');

-- CreateEnum
CREATE TYPE "RewardProgram" AS ENUM ('spend', 'visit');

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "cardType" "CardType" NOT NULL DEFAULT 'stamp_card',
    "cardDesc" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "rewardProgram" "RewardProgram" NOT NULL DEFAULT 'spend',
    "stampsCount" INTEGER NOT NULL,
    "earnRuleType" TEXT,
    "earnValue" INTEGER,
    "earnUnit" INTEGER,
    "barcodeType" "BarcodeType" NOT NULL DEFAULT 'qr_code',
    "logo" TEXT,
    "cardBackground" TEXT,
    "stampBackground" TEXT,
    "activeStamp" TEXT,
    "inactiveStamp" TEXT,
    "textColor" TEXT,
    "earnedRewardMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Card_businessId_idx" ON "Card"("businessId");
