/*
  Warnings:

  - A unique constraint covering the columns `[adjustmentRequestId]` on the table `PointTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PointTransaction" ADD COLUMN     "adjustmentRequestId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PointTransaction_adjustmentRequestId_key" ON "PointTransaction"("adjustmentRequestId");
