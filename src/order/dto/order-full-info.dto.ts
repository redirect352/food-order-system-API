import { MenuPositionItem } from 'src/menu/dto/menu-position-item.dto';
import { BranchOfficeMainInfoDto } from '../../branch-office/dto/branch-office-main-info.dto';
import { branch_office } from '@prisma/client';
export type OrderPositionFullInfo = {
  count: number;
  menuPosition: MenuPositionItem;
  comment?: string;
};
export class OrderFullInfoDto {
  public number: number;
  public issued: string;
  public fullPrice: number;
  public status: string;
  public updated: Date;
  public created: Date;
  public canCancel: boolean;
  public orderPositions: Array<OrderPositionFullInfo>;
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
      menuPosition: new MenuPositionItem(pos.menu_position),
      comment: pos?.comment,
    }));
    this.deliveryDestination = new BranchOfficeMainInfoDto(
      order.deliveryDestination as branch_office,
    );
  }
}
