-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_businessId_fkey";

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "country" TEXT,
ALTER COLUMN "name" SET DEFAULT 'Main Branch';

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
