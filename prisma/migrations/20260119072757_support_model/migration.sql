/*
  Warnings:

  - You are about to drop the column `businessName` on the `Support` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ticketId]` on the table `Support` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ticketId` to the `Support` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Support` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Support" DROP CONSTRAINT "Support_userId_fkey";

-- AlterTable
ALTER TABLE "Support" DROP COLUMN "businessName",
ADD COLUMN     "ticketId" TEXT NOT NULL,
ALTER COLUMN "businessId" SET DATA TYPE TEXT,
ALTER COLUMN "branchId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Support_ticketId_key" ON "Support"("ticketId");

-- AddForeignKey
ALTER TABLE "Support" ADD CONSTRAINT "Support_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Support" ADD CONSTRAINT "Support_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Support" ADD CONSTRAINT "Support_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
