/*
  Warnings:

  - You are about to drop the `Branchs` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `branchId` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Branchs" DROP CONSTRAINT "Branchs_businessId_fkey";

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "branchId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Branchs";

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
