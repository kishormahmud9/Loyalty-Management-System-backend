/*
  Warnings:

  - You are about to drop the column `adjustmentRequestId` on the `PointTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `adjustmentRequestId` on the `TransactionUndoRequest` table. All the data in the column will be lost.
  - Added the required column `transactionId` to the `TransactionUndoRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TransactionUndoRequest" DROP CONSTRAINT "TransactionUndoRequest_adjustmentRequestId_fkey";

-- DropIndex
DROP INDEX "PointTransaction_adjustmentRequestId_key";

-- DropIndex
DROP INDEX "TransactionUndoRequest_adjustmentRequestId_idx";

-- AlterTable
ALTER TABLE "PointTransaction" DROP COLUMN "adjustmentRequestId";

-- AlterTable
ALTER TABLE "TransactionUndoRequest" DROP COLUMN "adjustmentRequestId",
ADD COLUMN     "transactionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TransactionUndoRequest" ADD CONSTRAINT "TransactionUndoRequest_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "PointTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
