/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `dish_category` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "dish_category_name_key" ON "dish_category"("name");
