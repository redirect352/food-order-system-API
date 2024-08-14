import { Module } from '@nestjs/common';
import { DishService } from './dish.service';
import { DishController } from './dish.controller';
import { Dish } from './dish.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsDishExistsConstraint } from './validators/dish-exists.validator';
import { DishCategoryModule } from 'src/dish-category/dish-category.module';

@Module({
  imports: [TypeOrmModule.forFeature([Dish]), DishCategoryModule],
  exports: [DishService],
  controllers: [DishController],
  providers: [DishService, IsDishExistsConstraint],
})
export class DishModule {}
