import {
  BadRequestException,
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
import { Prisma, PrismaClient } from '@prisma/client';
import { GetOrdersListForPeriodDto } from './dto/get-orders-list-for-period.dto';
import { orderDeclaration } from '../lib/utils/orders-export/orders-export-file-generator.interface';
import { OrderStatusService } from './order-status/order-status.service';
import { ConfigService } from '@nestjs/config';
import { ImageService } from '../image/image.service';
@Injectable()
export class OrderService {
  constructor(
    private readonly priceService: PriceService,
    private readonly prismaService: PrismaService,
    private readonly menuPositionService: MenuPositionService,
    private readonly orderStatusService: OrderStatusService,
    private readonly configService: ConfigService,
    private readonly imageService: ImageService,
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

  async getUserOrdersList(
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
    const order = await this.prismaService.order.findFirst({
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
                    categoryId: true,
                    providingCanteenId: true,
                  },
                  include: {
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
    if (order) {
      const dishIds = order.order_to_menu_position.map(
        ({ menu_position }) => menu_position.dish.id,
      );
      const items = order.order_to_menu_position;
      await this.imageService.attachImagesToDishes(
        dishIds,
        items,
        (item) => item.menu_position.dish,
      );
    }
    return order;
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
        issued: orderDate,
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

  async getOrderListForPeriod(
    options: GetOrdersListForPeriodDto,
    extraOptions?: { closeOrders: boolean },
  ): Promise<orderDeclaration[]> {
    const { periodEnd, periodStart } = options;
    console.log(options);
    const items = await this.prismaService.order.findMany({
      omit: {
        statusId: true,
        clientId: true,
      },
      include: {
        user: { select: { employee: { include: { branch_office: true } } } },
        order_status: true,
        order_to_menu_position: {
          include: {
            menu_position: {
              include: {
                dish: {
                  include: { dish_category: true },
                  omit: {
                    id: true,
                    categoryId: true,
                    providingCanteenId: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { created: 'asc' },
      where: {
        created: { gte: periodStart, lte: periodEnd },
      },
    });
    if (extraOptions.closeOrders) {
      const updated = await this.updateOrdersStatus(
        this.configService.get('ORDER_CLOSED_STATUS'),
        {
          id: { in: items.map(({ id }) => id) },
        },
      );
      if (updated.count !== items.length) {
        throw new BadRequestException('невозможно обновить статус заказа');
      }
    }
    return items.map(
      ({ user, order_status, order_to_menu_position, ...etc }) => ({
        ...etc,
        canCancel: order_status.canCancel,
        client: {
          name: user.employee.name,
          surname: user.employee.surname,
          patronymic: user.employee.patronymic,
          personnelNumber: +user.employee.personnelNumber,
          officeName: user.employee.branch_office.name,
        },
        orderPositions: order_to_menu_position.map(
          ({ count, menu_position }) => ({
            count,
            menuPosition: {
              dishDescription: {
                ...menu_position.dish,
                dish_category: undefined,
                categoryName: menu_position.dish.dish_category.name,
              },
              price: menu_position.price,
              discount: menu_position.discount,
            },
          }),
        ),
      }),
    );
  }

  async updateOrdersStatus(newStatus: string, where: Prisma.orderWhereInput) {
    const status = await this.orderStatusService.getByName(newStatus);
    if (!status)
      throw new BadRequestException(
        `Желаемый статус заказа ${newStatus} не существует`,
      );
    return this.prismaService.order.updateMany({
      data: { statusId: status.id },
      where,
    });
  }
}
