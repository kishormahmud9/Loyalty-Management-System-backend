-- CreateTable
CREATE TABLE "businessOwnerNotification" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "loginAlerts" BOOLEAN NOT NULL DEFAULT true,
    "passwordChange" BOOLEAN NOT NULL DEFAULT true,
    "inAppNotification" BOOLEAN NOT NULL DEFAULT true,
    "smsAlerts" BOOLEAN NOT NULL DEFAULT false,
    "enableCardAllLocation" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businessOwnerNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchNotificationSetting" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchNotificationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "businessOwnerNotification_businessId_key" ON "businessOwnerNotification"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "BranchNotificationSetting_branchId_key" ON "BranchNotificationSetting"("branchId");

-- AddForeignKey
ALTER TABLE "businessOwnerNotification" ADD CONSTRAINT "businessOwnerNotification_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchNotificationSetting" ADD CONSTRAINT "BranchNotificationSetting_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
