import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetActiveOrdersDto } from './dto/get-active-orders.dto';
import { GetOrderFullInfoDto } from './dto/get-order-full-info.dto';
import { OrderFullInfoDto } from './dto/order-full-info.dto';

@Roles('client')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    return this.orderService.createOrder(createOrderDto, req.user.userId);
  }

  @Get('get/active')
  async getActive(@Query() getActiveOrdersDto: GetActiveOrdersDto, @Req() req) {
    return this.orderService.getActive(getActiveOrdersDto, req.user.userId);
  }

  @Get(':date/:number')
  async findOne(@Param() getOrderFullInfoDto: GetOrderFullInfoDto, @Req() req) {
    const { date, number } = getOrderFullInfoDto;
    const res = await this.orderService.getOrder(date, number, req.user.userId);
    if (!res) {
      throw new NotFoundException(`Заказ ${number}-${date} не найден`);
    }
    return new OrderFullInfoDto(res);
  }
}
