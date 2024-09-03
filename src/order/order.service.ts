import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Repository, DataSource } from 'typeorm';
import { Order } from './order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { User } from 'src/user/user.entity';
import { OrderStatus } from './order-status/order-status.entity';
import { OrderToMenuPosition } from './order-to-menu-position/order-to-menu-position.entity';
import { MenuPosition } from 'src/menu-position/menu-position.entity';
import { OrderStatusService } from './order-status/order-status.service';
import { PriceService } from 'lib/helpers/price/price.service';
import { OrderMainInfoDto } from './dto/order-main-info.dto';
import { env } from 'process';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private dataSource: DataSource,
    private readonly orderStatusService: OrderStatusService,
    private readonly priceService: PriceService,
  ) {}
  private readonly logger = new Logger(OrderService.name);

  async createOrder(createOrderDto: CreateOrderDto, userId: number) {
    const date = moment().format('YYYY-MM-DD');
    const { menuPositions, counts: menuPositionCounts } = createOrderDto;
    const defaultOrderStatus = process.env.ORDER_CREATED_STATUS;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const num = await queryRunner.manager
        .getRepository(Order)
        .createQueryBuilder()
        .useTransaction(true)
        .setLock('pessimistic_write')
        .select('Max(number)', 'max')
        .where('issued = :date', { date })
        .getRawOne();
      if (!num) {
        throw new BadRequestException();
      }
      const number = num.max + 1;

      const now = new Date();
      const positions = await queryRunner.manager
        .getRepository(MenuPosition)
        .createQueryBuilder('menuPosition')
        .leftJoin('menuPosition.menus', 'menu')
        .select(['menuPosition.id as id', 'price', 'discount'])
        .where('menu.expire > :date', { date: now })
        .andWhere('menu.relevantFrom <= :dateFrom', { dateFrom: now })
        .andWhere('menuPosition.id in (:idList)', {
          idList: menuPositions,
        })
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .from(User, 'user')
            .leftJoinAndSelect('user.employeeBasicData', 'employee')
            .leftJoinAndSelect('employee.office', 'UserOffice')
            .select(['userOffice.servingCanteenId as canteenId'])
            .where('user.id = :userId', { userId })
            .getQuery();
          return 'menu.providingCanteenId = ' + subQuery;
        })
        .getRawMany();
      if (positions.length !== menuPositions.length) {
        throw new ForbiddenException(
          'Выбранные пункты меню недоступны для заказа. Обновите меню',
        );
      }
      const order: Order = new Order();
      order.client = { id: userId, ...new User() };
      order.number = number;
      order.issued = date;
      order.fullPrice = this.priceService.getFullPrice(
        positions.map((pos) => ({
          price: pos.price,
          discount: pos.discount,
          count:
            menuPositionCounts[menuPositions.findIndex((id) => id === pos.id)],
        })),
      );
      order.status = (await this.orderStatusService.getByName(
        defaultOrderStatus,
        queryRunner.manager.getRepository(OrderStatus),
      )) ?? {
        ...new OrderStatus(),
        name: defaultOrderStatus,
      };
      const savedOrder = await queryRunner.manager.save(order);
      const promises = createOrderDto.menuPositions.map((item, index) => {
        const link = new OrderToMenuPosition();
        link.orderId = savedOrder.id;
        link.menuPositionId = item;
        link.count = menuPositionCounts[index];
        return queryRunner.manager.save(link);
      });
      savedOrder.orderToMenuPosition = await Promise.all(promises);
      const final = await queryRunner.manager.save(savedOrder);
      await queryRunner.commitTransaction();
      return {
        number: final.number,
        status: final.status,
        fullPrice: final.fullPrice,
      };
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getOrdersList(
    page: number,
    pageSize: number,
    userId: number,
    active?: number,
  ) {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .select()
      .leftJoinAndSelect('order.status', 'orderStatus')
      .leftJoinAndSelect('order.orderToMenuPosition', 'orderToMenuPosition')
      .leftJoinAndSelect('orderToMenuPosition.menuPosition', 'menuPosition')
      .leftJoinAndSelect('menuPosition.dish', 'dish')
      .where('clientId=:userId', { userId })
      .orderBy('order.created', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);
    if (active !== undefined) {
      query.andWhere('orderStatus.active=:active', { active });
    }
    const res = await query.getManyAndCount();
    return {
      totalPages: Math.ceil(res[1] / pageSize),
      items: res[0].map((item) => new OrderMainInfoDto(item)),
    };
  }

  async getOrder(issued: string, number: number, userId: string) {
    const res = await this.orderRepository
      .createQueryBuilder('order')
      .select()
      .leftJoinAndSelect('order.status', 'orderStatus')
      .leftJoinAndSelect('order.orderToMenuPosition', 'orderToMenuPosition')
      .leftJoinAndSelect('orderToMenuPosition.menuPosition', 'menuPosition')
      .leftJoinAndSelect('menuPosition.dish', 'dish')
      .leftJoinAndSelect('dish.image', 'dishImage')
      .leftJoinAndSelect('dish.providingCanteen', 'dishProducer')
      .leftJoinAndSelect('dish.category', 'dishCategory')
      .where('issued=:issued', { issued })
      .andWhere('number=:number', { number })
      .andWhere('clientId=:userId', { userId })
      .getOne();
    return res;
  }

  async cancelOrder(number: number, issued: string, userId: string) {
    const order = await this.orderRepository.findOne({
      where: { number, issued, client: { id: +userId } },
      relations: {
        status: true,
      },
    });
    if (!order) {
      throw new NotFoundException(`Заказ ${number}-${issued} не найден`);
    }
    if (!order.status.canCancel) {
      throw new ForbiddenException('Указанный заказ невозможно отменить');
    }
    return await this.orderRepository.delete({
      number,
      issued,
      client: { id: +userId },
    });
  }

  async getTotalForPeriod(periodStart: Date, periodEnd: Date, userId: string) {
    return await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.status', 'orderStatus')
      .select([
        'Count(*) as totalCount',
        'IFNULL(Sum(order.fullPrice), 0) as totalPrice',
      ])
      .where('order.created >= :periodStart', { periodStart })
      .andWhere('order.created <= :periodEnd', { periodEnd })
      .andWhere('order.clientId=:userId', { userId })
      .andWhere('orderStatus.name=:statusClosed', {
        statusClosed: env.ORDER_CLOSED_STATUS,
      })
      .execute();
  }
}
