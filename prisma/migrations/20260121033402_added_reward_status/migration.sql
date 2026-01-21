/*
  Warnings:

  - Added the required column `rewardStatus` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `rewardType` on the `Reward` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RewardStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('FREE_ITEM', 'EARN', 'REDEEM');

-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "rewardStatus" "RewardStatus" NOT NULL,
DROP COLUMN "rewardType",
ADD COLUMN     "rewardType" "RewardType" NOT NULL;
