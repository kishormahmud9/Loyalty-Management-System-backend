/*
  Warnings:

  - You are about to drop the column `customerRef` on the `PointTransaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PointTransaction" DROP COLUMN "customerRef",
ADD COLUMN     "customerId" TEXT;
