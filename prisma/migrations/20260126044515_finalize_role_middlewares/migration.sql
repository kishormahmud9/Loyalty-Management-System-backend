-- DropForeignKey
ALTER TABLE "PointAdjustmentRequest" DROP CONSTRAINT "PointAdjustmentRequest_branchId_fkey";

-- DropForeignKey
ALTER TABLE "PointAdjustmentRequest" DROP CONSTRAINT "PointAdjustmentRequest_staffId_fkey";

-- DropForeignKey
ALTER TABLE "PointTransaction" DROP CONSTRAINT "PointTransaction_branchId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionUndoRequest" DROP CONSTRAINT "TransactionUndoRequest_branchId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionUndoRequest" DROP CONSTRAINT "TransactionUndoRequest_staffId_fkey";

-- AlterTable
ALTER TABLE "PointAdjustmentRequest" ALTER COLUMN "staffId" DROP NOT NULL,
ALTER COLUMN "branchId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PointTransaction" ALTER COLUMN "branchId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TransactionUndoRequest" ALTER COLUMN "branchId" DROP NOT NULL,
ALTER COLUMN "staffId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionUndoRequest" ADD CONSTRAINT "TransactionUndoRequest_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionUndoRequest" ADD CONSTRAINT "TransactionUndoRequest_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointAdjustmentRequest" ADD CONSTRAINT "PointAdjustmentRequest_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointAdjustmentRequest" ADD CONSTRAINT "PointAdjustmentRequest_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
