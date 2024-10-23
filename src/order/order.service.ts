import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PriceService } from 'src/lib/helpers/price/price.service';
import { OrderMainInfoDto } from './dto/order-main-info.dto';
import { env } from 'process';
import { PrismaService } from '../database/prisma.service';
import { MenuPositionService } from '../menu-position/menu-position.service';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(
    private readonly priceService: PriceService,
    private readonly prismaService: PrismaService,
    private readonly menuPositionService: MenuPositionService,
  ) {}
  private readonly logger = new Logger(OrderService.name);

  async createOrder(createOrderDto: CreateOrderDto, userId: number) {
    const { menuPositions, counts: menuPositionCounts } = createOrderDto;
    const defaultOrderStatus = process.env.ORDER_CREATED_STATUS;

    const res = await this.prismaService.$transaction(async (tx) => {
      const res =
        await this.menuPositionService.checkMenuPositionsAvailableForUser(
          userId,
          menuPositions,
          tx as PrismaClient,
        );
      if (!res.status) {
        throw new ForbiddenException(
          'Выбранные пункты меню недоступны для заказа. Обновите меню',
        );
      }
      const orderNumber =
        (await this.getMaxOrderNumber(new Date(), tx as PrismaClient)) + 1;
      const fullPrice = this.priceService.getFullPrice(
        res.positions.map((pos) => ({
          price: pos.price,
          discount: pos.discount,
          count:
            menuPositionCounts[menuPositions.findIndex((id) => id === pos.id)],
        })),
      );
      const order = await this.createOrderDB(
        {
          orderNumber,
          issued: new Date(),
          fullPrice: fullPrice,
          status: defaultOrderStatus,
          userId,
        },
        tx as PrismaClient,
      );
      await this.createMenuPositionsToOrderRelations(
        {
          orderId: order.id,
          menuPositionsCounts: menuPositionCounts,
          menuPositionsIds: menuPositions,
        },
        tx as PrismaClient,
      );
      return {
        number: order.number,
        status: defaultOrderStatus,
        fullPrice: order.fullPrice,
      };
    });
    return res;
  }

  async getOrdersList(
    page: number,
    pageSize: number,
    userId: number,
    active?: boolean,
  ) {
    const items = await this.prismaService.order.findMany({
      omit: {
        id: true,
        statusId: true,
        clientId: true,
      },
      include: {
        order_status: true,
        order_to_menu_position: {
          include: {
            menu_position: { include: { dish: { select: { name: true } } } },
          },
        },
      },
      orderBy: { created: 'desc' },
      where: { clientId: userId, order_status: { active: active } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const count = await await this.prismaService.order.count({
      where: { clientId: userId, order_status: { active: active } },
    });
    return {
      totalPages: Math.ceil(count / pageSize),
      items: items.map((item) => new OrderMainInfoDto(item)),
    };
  }

  async getOrder(issued: string, number: number, userId: string) {
    return await this.prismaService.order.findFirst({
      omit: {
        id: true,
        statusId: true,
        clientId: true,
      },
      include: {
        order_status: true,
        order_to_menu_position: {
          include: {
            menu_position: {
              omit: { dishId: true },
              include: {
                dish: {
                  omit: {
                    imageId: true,
                    categoryId: true,
                    providingCanteenId: true,
                  },
                  include: {
                    image: { select: { name: true, path: true } },
                    providingCanteen: {
                      select: {
                        name: true,
                        address: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      where: {
        issued: new Date(issued),
        number,
        clientId: +userId,
      },
    });
  }

  async cancelOrder(number: number, issued: string, userId: string) {
    const order = await this.prismaService.order.findFirst({
      where: {
        issued: new Date(issued),
        number,
        clientId: +userId,
      },
      include: { order_status: true },
    });
    if (!order) {
      throw new NotFoundException(`Заказ ${number}-${issued} не найден`);
    }
    if (!order.order_status.canCancel) {
      throw new ForbiddenException('Указанный заказ невозможно отменить');
    }
    return await this.prismaService.order.delete({
      where: { id: order.id },
    });
  }

  async getTotalForPeriod(periodStart: Date, periodEnd: Date, userId: string) {
    return await this.prismaService.order.aggregate({
      _sum: {
        fullPrice: true,
      },
      _count: true,
      where: {
        created: { gte: periodStart, lte: periodEnd },
        clientId: +userId,
        order_status: {
          name: env.ORDER_CLOSED_STATUS,
        },
      },
    });
  }

  async getMaxOrderNumber(orderDate: Date, prismaClient: PrismaClient) {
    const orderNumber = await prismaClient.order.aggregate({
      _max: {
        number: true,
      },
      where: {
        issued: new Date(),
      },
    });
    return orderNumber._max.number;
  }
  async createOrderDB(
    data: {
      orderNumber: number;
      issued: Date;
      fullPrice: number;
      status: string;
      userId: number;
    },
    prismaClient: PrismaClient = this.prismaService,
  ) {
    return await prismaClient.order.create({
      data: {
        number: data.orderNumber,
        issued: data.issued,
        fullPrice: data.fullPrice,
        order_status: {
          connect: {
            name: data.status,
          },
        },
        user: {
          connect: { id: data.userId },
        },
      },
    });
  }

  async createMenuPositionsToOrderRelations(
    data: {
      menuPositionsIds: number[];
      menuPositionsCounts: number[];
      orderId: number;
    },
    prismaClient: PrismaClient = this.prismaService,
  ) {
    const { menuPositionsCounts, menuPositionsIds, orderId } = data;
    const promises = menuPositionsIds.map((item, index) =>
      prismaClient.order_to_menu_position.create({
        data: {
          count: menuPositionsCounts[index],
          menuPositionId: item,
          orderId,
        },
      }),
    );
    return await Promise.all(promises);
  }
}
