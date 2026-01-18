-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_businessId_fkey";

-- AlterTable
ALTER TABLE "Branch" ALTER COLUMN "name" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
