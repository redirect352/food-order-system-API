import { Controller } from '@nestjs/common';
import { DishCategoryService } from './dish-category.service';

@Controller('dish-category')
export class DishCategoryController {
  constructor(private readonly dishCategoryService: DishCategoryService) {}
}
