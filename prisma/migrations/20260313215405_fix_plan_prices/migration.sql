/*
  Warnings:

  - You are about to drop the column `price` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "price",
ADD COLUMN     "monthlyPrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "yearlyPrice" INTEGER NOT NULL DEFAULT 0;
