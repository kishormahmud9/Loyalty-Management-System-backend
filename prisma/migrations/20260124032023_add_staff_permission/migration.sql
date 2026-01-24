-- CreateTable
CREATE TABLE "StaffPermission" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "allowAddingPoints" BOOLEAN NOT NULL DEFAULT false,
    "allowRedeeming" BOOLEAN NOT NULL DEFAULT false,
    "allowVoids" BOOLEAN NOT NULL DEFAULT false,
    "viewCustomerList" BOOLEAN NOT NULL DEFAULT false,
    "allowViewingActiveOffers" BOOLEAN NOT NULL DEFAULT false,
    "editLoyaltyRulesOrOffers" BOOLEAN NOT NULL DEFAULT false,
    "addRemoveOtherStaff" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffPermission_businessId_key" ON "StaffPermission"("businessId");

-- AddForeignKey
ALTER TABLE "StaffPermission" ADD CONSTRAINT "StaffPermission_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
