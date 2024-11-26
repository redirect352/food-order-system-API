-- AlterTable
ALTER TABLE "user" ADD COLUMN     "refreshTokenHash" VARCHAR(255);

-- CreateIndex
-- CREATE INDEX "dish_name_idx" ON "dish" USING GIN ("name" to_tsvector('russian', name));
