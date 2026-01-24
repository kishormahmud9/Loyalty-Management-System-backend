-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('ADD', 'REDEEM', 'UNDO');

-- CreateTable
CREATE TABLE "PointAdjustmentRequest" (
    "id" TEXT NOT NULL,
    "type" "AdjustmentType" NOT NULL,
    "points" INTEGER NOT NULL,
    "customerId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "reason" TEXT,
    "status" "UndoRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointAdjustmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PointAdjustmentRequest_staffId_customerId_idx" ON "PointAdjustmentRequest"("staffId", "customerId");

-- CreateIndex
CREATE INDEX "PointAdjustmentRequest_branchId_idx" ON "PointAdjustmentRequest"("branchId");

-- CreateIndex
CREATE INDEX "PointAdjustmentRequest_status_idx" ON "PointAdjustmentRequest"("status");

-- AddForeignKey
ALTER TABLE "PointAdjustmentRequest" ADD CONSTRAINT "PointAdjustmentRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointAdjustmentRequest" ADD CONSTRAINT "PointAdjustmentRequest_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointAdjustmentRequest" ADD CONSTRAINT "PointAdjustmentRequest_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointAdjustmentRequest" ADD CONSTRAINT "PointAdjustmentRequest_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
