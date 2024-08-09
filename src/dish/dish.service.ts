import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDishDto } from './dto/create-dish.dto';
import { Dish } from './dish.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
  ) {}
  async createDish(createDishDto: CreateDishDto) {
    const res = await this.dishRepository
      .createQueryBuilder()
      .insert()
      .into(Dish)
      .values({
        ...createDishDto,
        providingCanteen: {
          id: createDishDto.providingCanteenId,
        },
        image: {
          id: createDishDto.imageId,
        },
        category: {
          id: createDishDto.dishCategoryId,
        },
      })
      .execute()
      .catch((err) => {
        if ((err.errno = 1452))
          throw new BadRequestException(
            'Ошибка добавления, изображения или филиала не существует в базе данных.',
          );
        throw new BadRequestException('Bad request');
      });
    return res.identifiers;
  }

  async getDishById(id: number) {
    return await this.dishRepository.findOne({ where: { id } });
  }
}
