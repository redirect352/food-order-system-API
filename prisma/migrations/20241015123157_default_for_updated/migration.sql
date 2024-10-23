-- DropForeignKey
ALTER TABLE "menu_menu_positions_menu_position" DROP CONSTRAINT "FK_2a39cc0f357b041f270ac7807c5";

-- DropIndex
DROP INDEX "IDX_2a39cc0f357b041f270ac7807c";

-- DropIndex
DROP INDEX "IDX_9c424b1ae18a97dbbed0b6b23c";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "changed" SET DEFAULT CURRENT_TIMESTAMP;

-- RenameForeignKey
ALTER TABLE "menu_menu_positions_menu_position" RENAME CONSTRAINT "FK_9c424b1ae18a97dbbed0b6b23c5" TO "menu_menu_positions_menu_position_menuId_fkey";

-- AddForeignKey
ALTER TABLE "menu_menu_positions_menu_position" ADD CONSTRAINT "menu_menu_positions_menu_position_menuPositionId_fkey" FOREIGN KEY ("menuPositionId") REFERENCES "menu_position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
