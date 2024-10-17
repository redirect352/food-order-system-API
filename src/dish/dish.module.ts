import { Module } from '@nestjs/common';
import { DishService } from './dish.service';
import { DishController } from './dish.controller';
import { IsDishExistsConstraint } from './validators/dish-exists.validator';
import { DishCategoryModule } from 'src/dish-category/dish-category.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DishCategoryModule, DatabaseModule],
  exports: [DishService],
  controllers: [DishController],
  providers: [DishService, IsDishExistsConstraint],
})
export class DishModule {}
