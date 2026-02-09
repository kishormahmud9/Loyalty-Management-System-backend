/*
  Warnings:

  - You are about to drop the column `isEnabled` on the `BranchNotificationSetting` table. All the data in the column will be lost.
  - You are about to drop the column `enableCardAllLocation` on the `businessOwnerNotification` table. All the data in the column will be lost.
  - You are about to drop the column `inAppNotification` on the `businessOwnerNotification` table. All the data in the column will be lost.
  - You are about to drop the column `loginAlerts` on the `businessOwnerNotification` table. All the data in the column will be lost.
  - You are about to drop the column `passwordChange` on the `businessOwnerNotification` table. All the data in the column will be lost.
  - You are about to drop the column `smsAlerts` on the `businessOwnerNotification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BranchNotificationSetting" DROP COLUMN "isEnabled",
ADD COLUMN     "settings" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "businessOwnerNotification" DROP COLUMN "enableCardAllLocation",
DROP COLUMN "inAppNotification",
DROP COLUMN "loginAlerts",
DROP COLUMN "passwordChange",
DROP COLUMN "smsAlerts",
ADD COLUMN     "settings" JSONB NOT NULL DEFAULT '[]';
