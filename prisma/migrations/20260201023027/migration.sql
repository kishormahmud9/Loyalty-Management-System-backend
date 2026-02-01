-- DropForeignKey
ALTER TABLE "Support" DROP CONSTRAINT "Support_branchId_fkey";

-- AlterTable
ALTER TABLE "Support" ADD COLUMN     "branchName" TEXT,
ADD COLUMN     "status" TEXT,
ALTER COLUMN "branchId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'BUSINESS_OWNER';

-- AddForeignKey
ALTER TABLE "Support" ADD CONSTRAINT "Support_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
