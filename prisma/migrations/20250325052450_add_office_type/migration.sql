/*
  Warnings:

  - You are about to drop the column `isCanteen` on the `branch_office` table. All the data in the column will be lost.
  - Added the required column `changed` to the `branch_office` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "branch_office_type" AS ENUM ('canteen', 'branch', 'special');
ALTER TABLE "branch_office" 

ADD COLUMN     "officeType" "branch_office_type" NOT NULL DEFAULT 'branch';

Update "branch_office" set "officeType" = 'canteen' where  "isCanteen" = true;
-- AlterTable
ALTER TABLE "branch_office" DROP COLUMN "isCanteen",
ADD COLUMN     "changed" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;
