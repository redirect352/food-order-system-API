import { menuPositionDeclaration } from '../menu-parser/menu-parser.interface';

export type orderDeclaration = {
  id: number;
  number: number;
  issued: Date;
  fullPrice: number;
  updated: Date;
  created: Date;
  canCancel: boolean;
  orderPositions: orderPositionDeclaration[];
  client: clientDeclaration;
};

export type orderPositionDeclaration = {
  count: number;
  menuPosition: menuPositionDeclaration;
};
export type clientDeclaration = {
  name: string;
  surname: string;
  patronymic: string;
  personnelNumber: number;
  officeName: string;
};
export interface IOrdersExportInFileOptions {
  documentHeading?: string;
}
export abstract class OrdersExportFileGenerator {
  abstract parseFile(
    ordersDeclaration: orderDeclaration[],
    options?: IOrdersExportInFileOptions,
  ): Promise<Buffer>;
  abstract getResultFileExtension(): string;
}
