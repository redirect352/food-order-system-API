import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuPosition } from './menu-position.entity';
import { CreateMenuPositionDto } from './dto/create-menu-position.dto';
import { DishService } from 'src/dish/dish.service';
import { GetUserMenuDto } from 'src/menu/dto/get-user-menu.dto';

@Injectable()
export class MenuPositionService {
  constructor(
    @InjectRepository(MenuPosition)
    private readonly menuPositionRepository: Repository<MenuPosition>,
    private readonly dishService: DishService,
  ) {}
  async createMenuPosition(createMenuPositionDto: CreateMenuPositionDto) {
    const { dishId, newDish, ...insertValues } = createMenuPositionDto;
    const insertDishId = dishId
      ? dishId
      : (await this.dishService.createDish(newDish))[0]?.id;
    if (!insertDishId) {
      throw new UnprocessableEntityException(
        'Ошибка создания блюда. Проверьте введенные данные.',
      );
    }
    const result = await this.menuPositionRepository
      .createQueryBuilder()
      .insert()
      .into(MenuPosition)
      .values({
        ...insertValues,
        dish: {
          id: insertDishId,
        },
      })
      .execute()
      .catch((err) => {
        console.log(err);
        if ((err.errno = 1452))
          throw new BadRequestException(
            'Ошибка добавления, связанного блюда не существует',
          );
        throw new BadRequestException('Bad request');
      });
    return result.identifiers;
  }

  async getMenuPositions(idList: number[], fields: string[] = []) {
    return this.menuPositionRepository
      .createQueryBuilder()
      .select(fields)
      .where('MenuPosition.id IN (:...idList)', {
        idList,
      })
      .getRawMany();
  }

  async getActual(canteenId: number, getUserMenuDto: GetUserMenuDto) {
    const { page, pageSize, dishCategoryId, productType } = getUserMenuDto;
    const now = new Date();
    const query = await this.menuPositionRepository
      .createQueryBuilder('menuPosition')
      .leftJoin('menuPosition.menus', 'menu')
      .leftJoinAndSelect('menuPosition.dish', 'dish')
      .leftJoinAndSelect('dish.image', 'dishImage')
      .leftJoinAndSelect('dish.providingCanteen', 'dishProducer')
      .leftJoinAndSelect('dish.category', 'dishCategory')
      .where('menu.providingCanteenId=:id', {
        id: canteenId,
      })
      .andWhere('menu.expire > :date', { date: now })
      .andWhere('menu.relevantFrom <= :dateFrom', { dateFrom: now })
      .skip((page - 1) * pageSize)
      .take(pageSize);
    if (dishCategoryId) {
      query.andWhere('dishCategory.id = :categoryId', {
        categoryId: dishCategoryId,
      });
    }
    if (productType) {
      if (productType === 'alien') {
        query.andWhere('dish.externalProducer is not NULL');
      } else {
        query.andWhere('dish.providingCanteen is not NULL');
      }
    }
    return await query.getMany();
  }
}
