-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'INACTIVE';

-- DropIndex
DROP INDEX "BusinessSubscription_businessId_key";

-- CreateIndex
CREATE INDEX "BusinessSubscription_businessId_idx" ON "BusinessSubscription"("businessId");
