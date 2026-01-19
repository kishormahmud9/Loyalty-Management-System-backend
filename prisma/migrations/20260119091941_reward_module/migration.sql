/*
  Warnings:

  - You are about to drop the column `description` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `pointsCost` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `branchId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `earningRule` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiryDays` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reward` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rewardName` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rewardPoints` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rewardType` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "description",
DROP COLUMN "isActive",
DROP COLUMN "pointsCost",
DROP COLUMN "title",
ADD COLUMN     "branchId" TEXT NOT NULL,
ADD COLUMN     "earningRule" TEXT NOT NULL,
ADD COLUMN     "expiryDays" INTEGER NOT NULL,
ADD COLUMN     "reward" TEXT NOT NULL,
ADD COLUMN     "rewardName" TEXT NOT NULL,
ADD COLUMN     "rewardPoints" INTEGER NOT NULL,
ADD COLUMN     "rewardType" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Reward_businessId_idx" ON "Reward"("businessId");

-- CreateIndex
CREATE INDEX "Reward_branchId_idx" ON "Reward"("branchId");

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
