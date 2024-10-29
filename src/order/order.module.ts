import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderStatusModule } from './order-status/order-status.module';
import { PriceModule } from 'src/lib/helpers/price/price.module';
import { DatabaseModule } from '../database/database.module';
import { MenuPositionModule } from '../menu-position/menu-position.module';
import { OrdersExportModule } from '../lib/utils/orders-export/orders-export.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    OrderStatusModule,
    PriceModule,
    DatabaseModule,
    MenuPositionModule,
    OrdersExportModule,
    ConfigModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
