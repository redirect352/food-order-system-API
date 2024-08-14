import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDishDto } from './dto/create-dish.dto';
import { Dish } from './dish.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DishCategoryService } from 'src/dish-category/dish-category.service';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
    private dishCategoryService: DishCategoryService,
  ) {}
  async createDish(createDishDto: CreateDishDto) {
    const { dishCategoryId, dishCategoryName } = createDishDto;
    console.log(createDishDto);
    const categoryId =
      dishCategoryId ??
      (await this.dishCategoryService.getByName(dishCategoryName))?.id ??
      -1;
    console.log({ dishCategoryId, dishCategoryName });
    if (dishCategoryName && categoryId === -1) {
      throw new BadRequestException(
        `Категории "${dishCategoryName}" не существует`,
      );
    }
    // return [{ id: 3 }];
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
        category:
          categoryId !== -1
            ? {
                id: categoryId,
              }
            : undefined,
      })
      .execute()
      .catch((err) => {
        console.log(err);
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
