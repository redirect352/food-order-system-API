import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDishDto } from './dto/create-dish.dto';
import { DishCategoryService } from 'src/dish-category/dish-category.service';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DishService {
  constructor(
    private dishCategoryService: DishCategoryService,
    private readonly prismaService: PrismaService,
  ) {}
  async createDish(createDishDto: CreateDishDto) {
    const { dishCategoryId, dishCategoryName, ...data } = createDishDto;
    const categoryId =
      dishCategoryId ??
      (await this.dishCategoryService.getByName(dishCategoryName))?.id ??
      -1;
    if (dishCategoryName && categoryId === -1) {
      throw new BadRequestException(
        `Категории "${dishCategoryName}" не существует`,
      );
    }
    delete createDishDto.dishCategoryName;
    createDishDto.dishCategoryId = categoryId;

    const dish = await this.prismaService.dish.create({
      data: { ...data, categoryId },
    });
    if (!dish) {
      throw new BadRequestException(
        'Ошибка добавления блюда. Некорректные данные.',
      );
    }
    return dish.id;
  }

  async getDishById(id: number) {
    return await this.prismaService.dish.findUnique({ where: { id } });
  }
}
