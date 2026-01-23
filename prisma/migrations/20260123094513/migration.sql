/*
  Warnings:

  - You are about to drop the `Reward` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_userId_fkey";

-- DropTable
DROP TABLE "Reward";

-- CreateTable
CREATE TABLE "RedeemReward" (
    "id" TEXT NOT NULL,
    "rewardName" TEXT NOT NULL,
    "rewardPoints" INTEGER NOT NULL,
    "rewardType" "RewardType" NOT NULL,
    "rewardImageFilePath" TEXT,
    "rewardImage" TEXT,
    "expiryDays" INTEGER NOT NULL,
    "earningRule" TEXT NOT NULL,
    "reward" TEXT NOT NULL,
    "rewardStatus" "RewardStatus" NOT NULL DEFAULT 'ACTIVE',
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RedeemReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardHistory" (
    "id" TEXT NOT NULL,
    "rewardPoints" INTEGER NOT NULL DEFAULT 0,
    "activeRewards" INTEGER NOT NULL DEFAULT 0,
    "availableRewards" INTEGER NOT NULL DEFAULT 0,
    "lastRewardReceived" TIMESTAMP(3),
    "cardExpireDate" TIMESTAMP(3),
    "earningRule" TEXT,
    "walletApp" TEXT,
    "customerId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RedeemReward_businessId_idx" ON "RedeemReward"("businessId");

-- CreateIndex
CREATE INDEX "RedeemReward_branchId_idx" ON "RedeemReward"("branchId");

-- CreateIndex
CREATE INDEX "RewardHistory_businessId_idx" ON "RewardHistory"("businessId");

-- CreateIndex
CREATE INDEX "RewardHistory_branchId_idx" ON "RewardHistory"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardHistory_customerId_branchId_key" ON "RewardHistory"("customerId", "branchId");

-- AddForeignKey
ALTER TABLE "RedeemReward" ADD CONSTRAINT "RedeemReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedeemReward" ADD CONSTRAINT "RedeemReward_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedeemReward" ADD CONSTRAINT "RedeemReward_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardHistory" ADD CONSTRAINT "RewardHistory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardHistory" ADD CONSTRAINT "RewardHistory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardHistory" ADD CONSTRAINT "RewardHistory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
