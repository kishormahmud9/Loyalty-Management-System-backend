-- CreateTable
CREATE TABLE "ApplePass" (
    "id" TEXT NOT NULL,
    "passTypeIdentifier" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "authenticationToken" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplePass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppleDevice" (
    "id" TEXT NOT NULL,
    "deviceLibraryIdentifier" TEXT NOT NULL,
    "pushToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppleDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppleRegistration" (
    "id" TEXT NOT NULL,
    "deviceLibraryIdentifier" TEXT NOT NULL,
    "passTypeIdentifier" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppleRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplePass_serialNumber_key" ON "ApplePass"("serialNumber");

-- CreateIndex
CREATE INDEX "ApplePass_passTypeIdentifier_serialNumber_idx" ON "ApplePass"("passTypeIdentifier", "serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AppleDevice_deviceLibraryIdentifier_key" ON "AppleDevice"("deviceLibraryIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "AppleRegistration_deviceLibraryIdentifier_passTypeIdentifie_key" ON "AppleRegistration"("deviceLibraryIdentifier", "passTypeIdentifier", "serialNumber");

-- AddForeignKey
ALTER TABLE "AppleRegistration" ADD CONSTRAINT "AppleRegistration_deviceLibraryIdentifier_fkey" FOREIGN KEY ("deviceLibraryIdentifier") REFERENCES "AppleDevice"("deviceLibraryIdentifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppleRegistration" ADD CONSTRAINT "AppleRegistration_serialNumber_fkey" FOREIGN KEY ("serialNumber") REFERENCES "ApplePass"("serialNumber") ON DELETE CASCADE ON UPDATE CASCADE;
