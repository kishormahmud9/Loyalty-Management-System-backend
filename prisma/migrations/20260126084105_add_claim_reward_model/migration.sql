-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('CLAIM', 'CLAIMED');

-- CreateTable
CREATE TABLE "ClaimReward" (
    "id" TEXT NOT NULL,
    "redeemRewardId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "claimStatus" "ClaimStatus" NOT NULL DEFAULT 'CLAIM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClaimReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClaimReward_customerId_idx" ON "ClaimReward"("customerId");

-- CreateIndex
CREATE INDEX "ClaimReward_branchId_idx" ON "ClaimReward"("branchId");

-- AddForeignKey
ALTER TABLE "ClaimReward" ADD CONSTRAINT "ClaimReward_redeemRewardId_fkey" FOREIGN KEY ("redeemRewardId") REFERENCES "RedeemReward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimReward" ADD CONSTRAINT "ClaimReward_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimReward" ADD CONSTRAINT "ClaimReward_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
