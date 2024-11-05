import { Inject, Injectable, NotAcceptableException } from '@nestjs/common';
import {
  IOrdersExportInFileOptions,
  orderDeclaration,
  OrdersExportFileGenerator,
} from './orders-export-file-generator.interface';

@Injectable()
export class OrdersExportService {
  constructor(
    @Inject('ORDERS_FILE_EXPORT_PROVIDERS')
    private readonly generators: OrdersExportFileGenerator[],
  ) {}
  async exportOrdersToDocx(
    ordersDeclaration: orderDeclaration[],
    options?: IOrdersExportInFileOptions,
  ) {
    const extName = '.docx';
    for (const generator of this.generators) {
      if (generator.getResultFileExtension().toLowerCase() === extName) {
        return generator.parseFile(ordersDeclaration, options);
      }
    }
    throw new NotAcceptableException(
      'Не поддерживается экспорт в формат .docx',
    );
  }
}
