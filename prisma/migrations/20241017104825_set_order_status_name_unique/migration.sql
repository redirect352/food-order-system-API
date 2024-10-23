/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `order_status` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "order_status_name_key" ON "order_status"("name");
