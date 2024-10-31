/*
  Warnings:

  - A unique constraint covering the columns `[tagName]` on the table `image_tag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "image_tag_tagName_key" ON "image_tag"("tagName");
