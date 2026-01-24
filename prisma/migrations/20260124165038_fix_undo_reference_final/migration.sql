/*
  Warnings:

  - A unique constraint covering the columns `[adjustmentRequestId]` on the table `PointTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "TransactionUndoRequest" DROP CONSTRAINT "TransactionUndoRequest_adjustmentRequestId_fkey";

-- AlterTable
ALTER TABLE "PointTransaction" ADD COLUMN     "adjustmentRequestId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PointTransaction_adjustmentRequestId_key" ON "PointTransaction"("adjustmentRequestId");

-- CreateIndex
CREATE INDEX "TransactionUndoRequest_adjustmentRequestId_idx" ON "TransactionUndoRequest"("adjustmentRequestId");

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_adjustmentRequestId_fkey" FOREIGN KEY ("adjustmentRequestId") REFERENCES "PointAdjustmentRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
