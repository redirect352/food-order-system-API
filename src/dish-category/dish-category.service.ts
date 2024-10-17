import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DishCategoryService {
  constructor(private readonly prismaService: PrismaService) {}
  async getById(id: number) {
    return this.prismaService.dish_category.findUnique({ where: { id } });
  }
  async getByName(name?: string) {
    if (!name) return null;
    return await this.prismaService.dish_category.findFirst({
      where: { name },
    });
  }
}
