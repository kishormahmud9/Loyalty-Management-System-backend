-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "preferences" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "targetCategory" TEXT;

-- AlterTable
ALTER TABLE "PointAdjustmentRequest" ADD COLUMN     "category" TEXT;

-- AlterTable
ALTER TABLE "PointTransaction" ADD COLUMN     "category" TEXT;
