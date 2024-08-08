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
}
