-- DropIndex
DROP INDEX "Business_isActive_idx";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "trialEndsAt" TIMESTAMP(3);
