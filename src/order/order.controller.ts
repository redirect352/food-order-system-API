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
import { GetOrdersListDto } from './dto/get-orders-list.dto';
import { OrderIdentificationDto } from './dto/order-identification.dto';
import { OrderFullInfoDto } from './dto/order-full-info.dto';
import { GetTotalDto } from './dto/get-total.dto';

@Roles('client')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    return this.orderService.createOrder(createOrderDto, req.user.userId);
  }

  @Get('list')
  async getList(@Query() getActiveOrdersDto: GetOrdersListDto, @Req() req) {
    const { page, pageSize, active } = getActiveOrdersDto;
    return this.orderService.getOrdersList(
      page,
      pageSize,
      req.user.userId,
      active,
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
  @Get('/total/')
  async getMonthTotal(@Query() getTotalDto: GetTotalDto, @Req() req) {
    const { periodEnd, periodStart } = getTotalDto;
    const now = new Date();
    const start =
      periodStart ?? new Date(now.getFullYear(), now.getUTCMonth(), 1);
    const res = await this.orderService.getTotalForPeriod(
      start,
      periodEnd,
      req.user.userId,
    );
    return {
      period: {
        start,
        end: periodEnd,
      },
      ...res[0],
    };
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
