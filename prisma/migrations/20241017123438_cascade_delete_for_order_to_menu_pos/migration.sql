-- DropForeignKey
ALTER TABLE "order_to_menu_position" DROP CONSTRAINT "order_to_menu_position_orderId_fkey";

-- AddForeignKey
ALTER TABLE "order_to_menu_position" ADD CONSTRAINT "order_to_menu_position_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
