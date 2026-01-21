/*
  Warnings:

  - You are about to drop the column `rewardImage` on the `Reward` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "rewardImage",
ADD COLUMN     "rewardImageFilePath" TEXT,
ADD COLUMN     "rewardImageUrl" TEXT;
