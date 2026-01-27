-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isPinSet" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinHash" TEXT;
