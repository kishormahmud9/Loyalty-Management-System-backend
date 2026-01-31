/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Business` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `BusinessSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "stripeCustomerId" TEXT;

-- AlterTable
ALTER TABLE "BusinessSubscription" ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "stripeStatus" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "stripeMonthlyPriceId" TEXT,
ADD COLUMN     "stripeYearlyPriceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Business_stripeCustomerId_key" ON "Business"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessSubscription_stripeSubscriptionId_key" ON "BusinessSubscription"("stripeSubscriptionId");
