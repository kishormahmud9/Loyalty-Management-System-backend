-- AlterTable
ALTER TABLE "Billing" ADD COLUMN     "amount" DOUBLE PRECISION,
ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "invoiceNo" TEXT,
ADD COLUMN     "invoicePath" TEXT,
ADD COLUMN     "invoiceUrl" TEXT,
ADD COLUMN     "planName" TEXT;
