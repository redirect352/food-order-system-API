import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateMenuPositionDto } from './dto/create-menu-position.dto';
import { DishService } from 'src/dish/dish.service';
import { GetUserMenuDto } from 'src/menu/dto/get-user-menu.dto';
import { PrismaService } from '../database/prisma.service';
import { PrismaClient } from '@prisma/client';
import { UserService } from '../user/user.service';

@Injectable()
export class MenuPositionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly dishService: DishService,
    private readonly userService: UserService,
  ) {}
  async createMenuPosition(createMenuPositionDto: CreateMenuPositionDto) {
    const { dishId, newDish, ...insertValues } = createMenuPositionDto;
    const insertDishId = dishId ?? (await this.dishService.createDish(newDish));
    if (!insertDishId) {
      throw new UnprocessableEntityException(
        'Ошибка создания блюда. Проверьте введенные данные.',
      );
    }
    const menuPosition = await this.prismaService.menu_position.create({
      data: {
        dishId: insertDishId,
        ...insertValues,
      },
    });
    return menuPosition.id;
  }

  async getMenuPositions(idList: number[]) {
    return this.prismaService.menu_position.findMany({
      where: { id: { in: idList } },
    });
  }

  async getActual(canteenId: number, getUserMenuDto: GetUserMenuDto) {
    const { page, pageSize, dishCategoryId, productType } = getUserMenuDto;
    let productTypeFilter: object | undefined = undefined;
    if (productType && productType.length === 1) {
      if (productType[0] === 'alien') {
        productTypeFilter = { not: null };
      } else {
        productTypeFilter = { equals: null };
      }
    }
    const where = {
      menus: {
        some: {
          providingCanteenId: canteenId,
          relevantFrom: { lt: new Date() },
          expire: { gt: new Date() },
        },
      },
      dish: {
        categoryId: { in: dishCategoryId },
        externalProducer: productTypeFilter,
      },
    };
    const items = await this.prismaService.menu_position.findMany({
      omit: { dishId: true },
      include: {
        dish: {
          include: {
            providingCanteen: { select: { name: true } },
            image: { select: { name: true, path: true } },
            dish_category: true,
          },
          omit: {
            providingCanteenId: true,
            imageId: true,
          },
        },
      },
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    const count = await await this.prismaService.menu_position.count({ where });
    const pageCount = Math.ceil(count / pageSize);
    return {
      pages: pageCount,
      items,
    };
  }

  async getActualCategories(canteenId: number) {
    const categories = await this.prismaService.menu_position.findMany({
      select: {
        dish: {
          select: {
            dish_category: true,
          },
        },
      },
      where: {
        menus: {
          some: {
            providingCanteenId: canteenId,
            relevantFrom: { lt: new Date() },
            expire: { gt: new Date() },
          },
        },
      },
    });
    console.dir(categories, { depth: null });
    const ids = new Set(categories.map(({ dish }) => dish.dish_category.id));
    return categories
      .map(({ dish }) => ({
        id: dish.dish_category.id,
        name: dish.dish_category.name,
      }))
      .filter(({ id }) => {
        if (ids.has(id)) {
          ids.delete(id);
          return true;
        }
      });
  }
  async checkMenuPositionsAvailableForUser(
    userId: number,
    menuPositionsIds: number[],
    prismaClient: PrismaClient = this.prismaService,
  ) {
    const canteenId = await this.userService.findUserServingCanteen(
      userId,
      prismaClient,
    );
    const positions = await prismaClient.menu_position.findMany({
      select: {
        id: true,
        price: true,
        discount: true,
      },
      where: {
        id: { in: menuPositionsIds },
        menus: {
          some: {
            providingCanteenId: canteenId,
            relevantFrom: { lt: new Date() },
            expire: { gt: new Date() },
          },
        },
      },
    });
    return {
      status: positions.length === menuPositionsIds.length,
      positions,
    };
  }
}
