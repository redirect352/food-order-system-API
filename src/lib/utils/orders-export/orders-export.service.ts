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
    for (const parser of this.generators) {
      if (parser.getResultFileExtension().toLowerCase() === extName) {
        return parser.parseFile(ordersDeclaration, options);
      }
    }
    throw new NotAcceptableException(
      'Не поддерживается экспорт в формат .docx',
    );
  }
}
