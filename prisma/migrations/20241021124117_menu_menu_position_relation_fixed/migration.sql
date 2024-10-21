/*
  Warnings:

  - You are about to drop the `menu_menu_positions_menu_position` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "menu_menu_positions_menu_position" DROP CONSTRAINT "menu_menu_positions_menu_position_menuId_fkey";

-- DropForeignKey
ALTER TABLE "menu_menu_positions_menu_position" DROP CONSTRAINT "menu_menu_positions_menu_position_menuPositionId_fkey";

-- DropTable
DROP TABLE "menu_menu_positions_menu_position";

-- CreateTable
CREATE TABLE "_menuTomenu_position" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_menuTomenu_position_AB_unique" ON "_menuTomenu_position"("A", "B");

-- CreateIndex
CREATE INDEX "_menuTomenu_position_B_index" ON "_menuTomenu_position"("B");

-- AddForeignKey
ALTER TABLE "_menuTomenu_position" ADD CONSTRAINT "_menuTomenu_position_A_fkey" FOREIGN KEY ("A") REFERENCES "menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_menuTomenu_position" ADD CONSTRAINT "_menuTomenu_position_B_fkey" FOREIGN KEY ("B") REFERENCES "menu_position"("id") ON DELETE CASCADE ON UPDATE CASCADE;
