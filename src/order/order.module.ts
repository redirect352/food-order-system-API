import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderToMenuPosition } from './order-to-menu-position/order-to-menu-position.entity';
import { OrderStatusModule } from './order-status/order-status.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderToMenuPosition]),
    OrderStatusModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
