CREATE TABLE "discount_vouchers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "discount_code_id" TEXT NOT NULL,
    "discount_percent" INTEGER NOT NULL,
    "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "discount_vouchers_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "discount_vouchers" ADD CONSTRAINT "discount_vouchers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "discount_vouchers" ADD CONSTRAINT "discount_vouchers_discount_code_id_fkey" FOREIGN KEY ("discount_code_id") REFERENCES "discount_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
