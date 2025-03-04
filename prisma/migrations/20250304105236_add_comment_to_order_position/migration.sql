-- AlterTable
ALTER TABLE "_MenuForConsumption" ADD CONSTRAINT "_MenuForConsumption_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_MenuForConsumption_AB_unique";

-- AlterTable
ALTER TABLE "_imageToimage_tag" ADD CONSTRAINT "_imageToimage_tag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_imageToimage_tag_AB_unique";

-- AlterTable
ALTER TABLE "_menuTomenu_position" ADD CONSTRAINT "_menuTomenu_position_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_menuTomenu_position_AB_unique";

-- AlterTable
ALTER TABLE "order_to_menu_position" ADD COLUMN  "comment" TEXT;
