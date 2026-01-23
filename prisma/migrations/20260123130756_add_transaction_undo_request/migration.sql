-- CreateEnum
CREATE TYPE "UndoRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "TransactionUndoRequest" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "UndoRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionUndoRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransactionUndoRequest_businessId_idx" ON "TransactionUndoRequest"("businessId");

-- CreateIndex
CREATE INDEX "TransactionUndoRequest_branchId_idx" ON "TransactionUndoRequest"("branchId");

-- CreateIndex
CREATE INDEX "TransactionUndoRequest_status_idx" ON "TransactionUndoRequest"("status");

-- AddForeignKey
ALTER TABLE "TransactionUndoRequest" ADD CONSTRAINT "TransactionUndoRequest_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "PointTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionUndoRequest" ADD CONSTRAINT "TransactionUndoRequest_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionUndoRequest" ADD CONSTRAINT "TransactionUndoRequest_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionUndoRequest" ADD CONSTRAINT "TransactionUndoRequest_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
