import { Module } from '@nestjs/common';
import { OrdersExportService } from './orders-export.service';
import { OrdersExportFileGenerator } from './orders-export-file-generator.interface';
import { DocxOrderGenerator } from './file-generator-implementations/docx-orders-file-generator';

@Module({
  providers: [
    OrdersExportService,
    {
      provide: 'ORDERS_FILE_EXPORT_PROVIDERS',
      useFactory: () => {
        return [new DocxOrderGenerator()] as OrdersExportFileGenerator[];
      },
    },
  ],
  exports: [OrdersExportService],
})
export class OrdersExportModule {}
