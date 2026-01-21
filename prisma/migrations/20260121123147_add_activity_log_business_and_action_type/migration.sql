-- CreateEnum
CREATE TYPE "ActivityActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'OTHER');

-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "actionType" "ActivityActionType" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "businessId" TEXT;

-- CreateIndex
CREATE INDEX "ActivityLog_businessId_idx" ON "ActivityLog"("businessId");

-- CreateIndex
CREATE INDEX "ActivityLog_actionType_idx" ON "ActivityLog"("actionType");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
