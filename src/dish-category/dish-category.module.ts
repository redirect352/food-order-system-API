import { Module } from '@nestjs/common';
import { DishCategoryService } from './dish-category.service';
import { DishCategoryController } from './dish-category.controller';
import { IsDishCategoryExistsConstraint } from './validators/dish-category-exists.validator';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DishCategoryController],
  providers: [DishCategoryService, IsDishCategoryExistsConstraint],
  exports: [DishCategoryService],
})
export class DishCategoryModule {}
