/*
  Warnings:

  - You are about to drop the column `transactionId` on the `TransactionUndoRequest` table. All the data in the column will be lost.
  - Added the required column `adjustmentRequestId` to the `TransactionUndoRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TransactionUndoRequest" DROP CONSTRAINT "TransactionUndoRequest_transactionId_fkey";

-- AlterTable
ALTER TABLE "TransactionUndoRequest" DROP COLUMN "transactionId",
ADD COLUMN     "adjustmentRequestId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TransactionUndoRequest" ADD CONSTRAINT "TransactionUndoRequest_adjustmentRequestId_fkey" FOREIGN KEY ("adjustmentRequestId") REFERENCES "PointAdjustmentRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
