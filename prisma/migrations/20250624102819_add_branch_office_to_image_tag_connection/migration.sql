-- AlterTable
ALTER TABLE "branch_office" ALTER COLUMN "changed" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "image_tag" ADD COLUMN     "officeId" INTEGER;

-- AddForeignKey
ALTER TABLE "image_tag" ADD CONSTRAINT "image_tag_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "branch_office"("id") ON DELETE SET NULL ON UPDATE CASCADE;
