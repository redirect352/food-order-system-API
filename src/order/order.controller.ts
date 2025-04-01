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
  StreamableFile,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersListDto } from './dto/get-orders-list.dto';
import { OrderIdentificationDto } from './dto/order-identification.dto';
import { OrderFullInfoDto } from './dto/order-full-info.dto';
import { GetTotalDto } from './dto/get-total.dto';
import { GetOrdersListForPeriodDto } from './dto/get-orders-list-for-period.dto';
import * as dayjs from 'dayjs';
import { Readable } from 'stream';
import { OrdersExportService } from '../lib/utils/orders-export/orders-export.service';
import { BranchOfficeService } from '../branch-office/branch-office.service';
import { SearchOrdersDto } from './dto/search-orders.dto';

@Roles('client')
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly branchOfficeService: BranchOfficeService,
    private readonly orderExportService: OrdersExportService,
  ) {}

  @Post('create')
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    return this.orderService.createOrder(createOrderDto, req.user.userId);
  }

  @Get('list')
  async getList(@Query() getActiveOrdersDto: GetOrdersListDto, @Req() req) {
    const { page, pageSize, active } = getActiveOrdersDto;
    const result = await this.orderService.getUserOrdersList(
      page,
      pageSize,
      req.user.userId,
      active,
    );
    return result;
  }

  @Roles('admin', 'menu_moderator')
  @Get('/actual/export-list/docx')
  async exportActualOrdersDocx(
    @Query() params: GetOrdersListForPeriodDto,
    @Res({ passthrough: true }) res,
  ) {
    const { periodStart, periodEnd } = params;
    const dateFormat = 'DD MMMM YYYY HH.mm';
    const orderDeclaration = await this.orderService.getOrderListForPeriod(
      params,
      { closeOrders: true },
    );
    const destinationOffice =
      await this.branchOfficeService.getBranchOfficeById(
        params.deliveryDestinationId,
      );
    const buffer = await this.orderExportService.exportOrdersToDocx(
      orderDeclaration,
      {
        documentHeading: `Список заказов с ${dayjs(periodStart).locale('ru').format(dateFormat)} по ${dayjs(periodEnd).locale('ru').format(dateFormat)} по филиалу ${destinationOffice.name}`,
      },
    );
    const file = Readable.from(buffer);

    const filename = `Заказы-${destinationOffice.name}-(${dayjs(periodStart).format('DD.MM.YY HH.mm')} - ${dayjs(periodEnd).format('DD.MM.YY HH.mm')}).docx`;
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename=${encodeURIComponent(filename)}`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });
    return new StreamableFile(file);
  }

  @Get(':date/:number')
  async findOne(
    @Param() getOrderFullInfoDto: OrderIdentificationDto,
    @Req() req,
  ) {
    const { date, number } = getOrderFullInfoDto;
    const isAdmin =
      req.user.role === 'admin' || req.user.role === 'menu_moderator';
    const userId = isAdmin ? undefined : +req.user.userId;
    const res = await this.orderService.getOrder(date, number, userId);
    if (!res) {
      throw new NotFoundException(`Заказ ${number}-${date} не найден`);
    }
    return new OrderFullInfoDto(res, isAdmin);
  }

  @Get('/total')
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
      totalCount: res._count,
      totalPrice: res._sum.fullPrice ?? 0,
    };
  }

  @Delete('/cancel/:date/:number')
  async cancelOrder(
    @Param() { number, date }: OrderIdentificationDto,
    @Req() req,
  ) {
    await this.orderService.cancelOrder(number, date, req.user.userId);
  }

  @Roles('menu_moderator')
  @Get('/search')
  async searchOrders(@Query() searchOrdersDto: SearchOrdersDto) {
    return await this.orderService.searchOrders(searchOrdersDto);
  }
}
