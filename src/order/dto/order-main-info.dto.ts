import { branch_office } from '@prisma/client';
import { BranchOfficeMainInfoDto } from '../../branch-office/dto/branch-office-main-info.dto';

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
  public deliveryDestination: BranchOfficeMainInfoDto;

  public constructor(order: any) {
    this.number = order.number;
    this.issued = order.issued;
    this.fullPrice = order.fullPrice;
    this.status = order.order_status.name;
    this.updated = order.updated;
    this.created = order.created;
    this.canCancel = order.order_status.canCancel;
    this.orderPositions = order.order_to_menu_position.map((pos) => ({
      count: pos.count,
      price: pos.menu_position.price,
      discount: pos.menu_position.discount,
      name: pos.menu_position.dish?.name,
    }));
    this.deliveryDestination = new BranchOfficeMainInfoDto(
      order.deliveryDestination as branch_office,
    );
  }
}
