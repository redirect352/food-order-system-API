import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDishDto } from './dto/create-dish.dto';
import { DishCategoryService } from 'src/dish-category/dish-category.service';
import { PrismaService } from '../database/prisma.service';
import { dishDeclaration } from '../lib/utils/menu-parser/menu-parser.interface';

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

  async findOrCreateDishes(
    dishes: dishDeclaration[],
    providingCanteenId: number,
  ) {
    const dishesExisting = await this.prismaService.$transaction(
      dishes.map(({ categoryName, ...where }) => {
        return this.prismaService.dish.findFirst({
          where: {
            ...where,
            dish_category: {
              name: categoryName,
            },
            providingCanteenId,
          },
        });
      }),
    );
    const dishesCreated = await this.prismaService.$transaction(
      dishesExisting
        .map((dish, index) => {
          if (!dish) {
            const { categoryName, ...dishData } = dishes[index];
            return this.prismaService.dish.create({
              data: {
                ...dishData,
                providingCanteen: {
                  connect: { id: providingCanteenId },
                },
                dish_category: {
                  connectOrCreate: {
                    where: { name: categoryName },
                    create: { name: categoryName },
                  },
                },
              },
            });
          }
        })
        .filter((item) => !!item),
    );
    return dishesExisting.map((item) => item ?? dishesCreated.shift());
  }
}
