-- CreateTable
CREATE TABLE "EarnReward" (
    "id" TEXT NOT NULL,
    "rewardName" TEXT NOT NULL,
    "earnPoint" INTEGER NOT NULL,
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

    CONSTRAINT "EarnReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EarnReward_businessId_idx" ON "EarnReward"("businessId");

-- CreateIndex
CREATE INDEX "EarnReward_branchId_idx" ON "EarnReward"("branchId");

-- AddForeignKey
ALTER TABLE "EarnReward" ADD CONSTRAINT "EarnReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarnReward" ADD CONSTRAINT "EarnReward_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarnReward" ADD CONSTRAINT "EarnReward_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
