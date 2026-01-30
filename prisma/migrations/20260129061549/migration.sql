-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
