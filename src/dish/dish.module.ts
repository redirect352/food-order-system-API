import { Module } from '@nestjs/common';
import { DishService } from './dish.service';
import { DishController } from './dish.controller';
import { Dish } from './dish.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsDishExistsConstraint } from './validators/dish-exists.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Dish])],
  exports: [DishService],
  controllers: [DishController],
  providers: [DishService, IsDishExistsConstraint],
})
export class DishModule {}
