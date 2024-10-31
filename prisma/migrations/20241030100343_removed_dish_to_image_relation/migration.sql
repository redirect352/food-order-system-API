/*
  Warnings:

  - You are about to drop the column `imageId` on the `dish` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "dish" DROP CONSTRAINT "dish_imageId_fkey";

-- AlterTable
ALTER TABLE "dish" DROP COLUMN "imageId";
