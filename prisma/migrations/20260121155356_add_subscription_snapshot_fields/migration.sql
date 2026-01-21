-- AlterTable
ALTER TABLE "BusinessSubscription" ADD COLUMN     "maxBranches" INTEGER,
ADD COLUMN     "maxCards" INTEGER,
ADD COLUMN     "maxStaff" INTEGER,
ADD COLUMN     "planName" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION;
