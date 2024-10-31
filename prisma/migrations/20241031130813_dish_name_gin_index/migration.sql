-- CreateIndex
CREATE INDEX "dish_name_idx" ON "dish" USING GIN (to_tsvector('russian', name));
