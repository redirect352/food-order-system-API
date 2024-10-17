import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OrderStatusService {
  constructor(private readonly prismaService: PrismaService) {}
  async getById(id: number) {
    return await this.prismaService.order_status.findUnique({ where: { id } });
  }
  async getByName(name?: string) {
    if (!name) return null;
    return await this.prismaService.order_status.findFirst({ where: { name } });
  }
}
