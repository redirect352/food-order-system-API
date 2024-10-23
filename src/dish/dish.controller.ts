import { Body, Controller, Post, Res } from '@nestjs/common';
import { DishService } from './dish.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Roles('admin', 'client')
@Controller('dish')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Post('/create')
  async createDish(
    @Body() createDishDto: CreateDishDto,
    @Res({ passthrough: true }) res,
  ) {
    const result = await this.dishService.createDish(createDishDto);
    if (!result) {
      res.status(304);
      return { message: 'Блюдо не добавлено в каталог' };
    } else {
      return result;
    }
  }
}
