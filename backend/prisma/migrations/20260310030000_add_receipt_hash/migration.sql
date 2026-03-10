-- AlterTable
ALTER TABLE "purchases" ADD COLUMN "receipt_hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "purchases_receipt_hash_key" ON "purchases"("receipt_hash");
