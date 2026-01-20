-- CreateTable
CREATE TABLE "Branchs" (
    "id" SERIAL NOT NULL,
    "businessId" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "branchLocation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branchs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Branchs_businessId_idx" ON "Branchs"("businessId");

-- AddForeignKey
ALTER TABLE "Branchs" ADD CONSTRAINT "Branchs_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
