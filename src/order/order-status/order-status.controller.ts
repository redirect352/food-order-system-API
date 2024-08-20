import { Controller } from '@nestjs/common';
import { OrderStatusService } from './order-status.service';

@Controller('order-status')
export class OrderStatusController {
  constructor(private readonly orderStatusService: OrderStatusService) {}
}
