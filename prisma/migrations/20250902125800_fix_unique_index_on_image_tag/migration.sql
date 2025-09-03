/*
  Warnings:

  - A unique constraint covering the columns `[tagName,officeId]` on the table `image_tag` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "image_tag_tagName_key";

-- CreateIndex
CREATE UNIQUE INDEX "image_tag_tagName_officeId_key" ON "image_tag"("tagName", "officeId");
