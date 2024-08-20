import {
  BadRequestException,
  ForbiddenException,
  Injectable,
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

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private dataSource: DataSource,
    private readonly orderStatusService: OrderStatusService,
  ) {}

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
        .select(['menuPosition.id as id'])
        .where('menu.expire > :date', { date: now })
        .andWhere('menu.relevantFrom <= :dateFrom', { dateFrom: now })
        .andWhere('menuPosition.id in (:idList)', {
          idList: menuPositions,
        })
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .from(User, 'user')
            .leftJoinAndSelect('user.office', 'userOffice')
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
      };
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await queryRunner.release();
    }
  }
}
