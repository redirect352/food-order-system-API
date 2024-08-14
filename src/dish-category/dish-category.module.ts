import { Module } from '@nestjs/common';
import { DishCategoryService } from './dish-category.service';
import { DishCategoryController } from './dish-category.controller';
import { DishCategory } from './dish-category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsDishCategoryExistsConstraint } from './validators/dish-category-exists.validator';

@Module({
  imports: [TypeOrmModule.forFeature([DishCategory])],
  controllers: [DishCategoryController],
  providers: [DishCategoryService, IsDishCategoryExistsConstraint],
  exports: [DishCategoryService],
})
export class DishCategoryModule {}
