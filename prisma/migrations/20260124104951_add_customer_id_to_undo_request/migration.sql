/*
  Backfill customerId safely from PointTransaction
*/

-- 1️⃣ Add column as NULLABLE first
ALTER TABLE "TransactionUndoRequest"
ADD COLUMN "customerId" TEXT;

-- 2️⃣ Backfill customerId using transactionId
UPDATE "TransactionUndoRequest" ur
SET "customerId" = pt."customerId"
FROM "PointTransaction" pt
WHERE ur."transactionId" = pt."id";

-- 3️⃣ Make customerId REQUIRED
ALTER TABLE "TransactionUndoRequest"
ALTER COLUMN "customerId" SET NOT NULL;

-- 4️⃣ Create index (staff + customer)
CREATE INDEX "TransactionUndoRequest_staffId_customerId_idx"
ON "TransactionUndoRequest" ("staffId", "customerId");

-- 5️⃣ Add foreign key
ALTER TABLE "TransactionUndoRequest"
ADD CONSTRAINT "TransactionUndoRequest_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
