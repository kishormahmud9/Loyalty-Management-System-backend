-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "PlatformGeoSetting" (
    "id" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "radiusMeters" INTEGER NOT NULL DEFAULT 100,
    "cooldownHours" INTEGER NOT NULL DEFAULT 8,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformGeoSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoNotificationState" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "lastSentAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeoNotificationState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeoNotificationState_customerId_idx" ON "GeoNotificationState"("customerId");

-- CreateIndex
CREATE INDEX "GeoNotificationState_branchId_idx" ON "GeoNotificationState"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "GeoNotificationState_customerId_branchId_key" ON "GeoNotificationState"("customerId", "branchId");

-- AddForeignKey
ALTER TABLE "GeoNotificationState" ADD CONSTRAINT "GeoNotificationState_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoNotificationState" ADD CONSTRAINT "GeoNotificationState_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
