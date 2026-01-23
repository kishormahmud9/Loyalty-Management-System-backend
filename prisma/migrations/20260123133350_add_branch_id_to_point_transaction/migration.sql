/*
  Warnings:

  - Added the required column `branchId` to the `PointTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PointTransaction" ADD COLUMN     "branchId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "PointTransaction_branchId_idx" ON "PointTransaction"("branchId");

-- CreateIndex
CREATE INDEX "PointTransaction_businessId_idx" ON "PointTransaction"("businessId");

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
