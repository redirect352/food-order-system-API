import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetActiveOrdersDto } from './dto/get-active-orders.dto';
import { OrderIdentificationDto } from './dto/order-identification.dto';
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
    const { page, pageSize } = getActiveOrdersDto;
    return this.orderService.getOrdersList(
      true,
      page,
      pageSize,
      req.user.userId,
    );
  }

  @Get(':date/:number')
  async findOne(
    @Param() getOrderFullInfoDto: OrderIdentificationDto,
    @Req() req,
  ) {
    const { date, number } = getOrderFullInfoDto;
    const res = await this.orderService.getOrder(date, number, req.user.userId);
    if (!res) {
      throw new NotFoundException(`Заказ ${number}-${date} не найден`);
    }
    return new OrderFullInfoDto(res);
  }

  @Delete('/cancel/:date/:number')
  async cancelOrder(
    @Param() { number, date }: OrderIdentificationDto,
    @Req() req,
    @Res({ passthrough: true }) response,
  ) {
    const res = await this.orderService.cancelOrder(
      number,
      date,
      req.user.userId,
    );
    if (res.affected === 0) response.status(304);
  }
}
