import { Injectable } from '@nestjs/common';
import { OrderStatus } from './order-status.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrderStatusService {
  constructor(
    @InjectRepository(OrderStatus)
    private orderStatusRepository: Repository<OrderStatus>,
  ) {}
  async getById(id: number, repository = this.orderStatusRepository) {
    return await repository.findOne({ where: { id } });
  }
  async getByName(name?: string, repository = this.orderStatusRepository) {
    if (!name) return null;
    return await repository.findOne({ where: { name } });
  }
}
