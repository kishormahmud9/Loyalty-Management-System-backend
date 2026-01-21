/*
  Warnings:

  - The primary key for the `Support` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Support" DROP CONSTRAINT "Support_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Support_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Support_id_seq";
