import { Order } from '../order.entity';
export type OrderPositionMainInfo = {
  count: number;
  price: number;
  discount: number;
  name: string;
};
export class OrderMainInfoDto {
  public number: number;
  public issued: string;
  public fullPrice: number;
  public status: string;
  public canCancel: boolean;
  public updated: Date;
  public created: Date;
  public orderPositions: Array<OrderPositionMainInfo>;

  public constructor(order: Order) {
    this.number = order.number;
    this.issued = order.issued;
    this.fullPrice = order.fullPrice;
    this.status = order.status.name;
    this.updated = order.updated;
    this.created = order.created;
    this.canCancel = order.status.canCancel;
    this.orderPositions = order.orderToMenuPosition.map((pos) => ({
      count: pos.count,
      price: pos.menuPosition.price,
      discount: pos.menuPosition.discount,
      name: pos.menuPosition.dish.name,
    }));
  }
}
