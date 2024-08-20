import { MenuPositionItem } from 'src/menu/dto/menu-position-item.dto';
import { Order } from '../order.entity';
export type OrderPositionFullInfo = {
  count: number;
  menuPosition: MenuPositionItem;
};
export class OrderFullInfoDto {
  public number: number;
  public issued: string;
  public fullPrice: number;
  public status: string;
  public updated: Date;
  public created: Date;
  public orderPositions: Array<OrderPositionFullInfo>;

  public constructor(order: Order) {
    this.number = order.number;
    this.issued = order.issued;
    this.fullPrice = order.fullPrice;
    this.status = order.status.name;
    this.updated = order.updated;
    this.created = order.created;
    this.orderPositions = order.orderToMenuPosition.map((pos) => ({
      count: pos.count,
      menuPosition: new MenuPositionItem(pos.menuPosition),
    }));
  }
}
