/*
  Warnings:

  - You are about to drop the column `rewardImageUrl` on the `Reward` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "rewardImageUrl",
ADD COLUMN     "rewardImage" TEXT;
