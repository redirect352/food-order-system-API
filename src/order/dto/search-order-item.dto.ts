import { branch_office } from '@prisma/client';
import { BranchOfficeMainInfoDto } from '../../branch-office/dto/branch-office-main-info.dto';

export class SearchOrderItemDto {
  public id: number;
  public number: number;
  public issued: string;
  public fullPrice: number;
  public status: string;
  public canCancel: boolean;
  public updated: Date;
  public created: Date;
  public deliveryDestination: BranchOfficeMainInfoDto;
  public orderPositionsCount: number;
  public clientName: string;
  public clientPersonnelNumber: string;

  public constructor(order: any) {
    this.id = order.id;
    this.number = order.number;
    this.issued = order.issued;
    this.fullPrice = order.fullPrice;
    this.status = order.order_status.name;
    this.updated = order.updated;
    this.created = order.created;
    this.canCancel = order.order_status.canCancel;
    this.orderPositionsCount = order._count.order_to_menu_position;
    this.deliveryDestination = new BranchOfficeMainInfoDto(
      order.deliveryDestination as branch_office,
    );
    const employee = order.user.employee;
    this.clientName = `${employee.surname} ${employee?.name.charAt(0).toLocaleUpperCase()}. ${employee?.patronymic.charAt(0).toLocaleUpperCase()}`;
    this.clientPersonnelNumber = order.user.employee.personnelNumber;
  }
}
