import { Module } from '@nestjs/common';
import { MenuPositionService } from './menu-position.service';
import { MenuPositionController } from './menu-position.controller';
import { MenuPosition } from './menu-position.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishModule } from 'src/dish/dish.module';
import { IsMenuPositionsExistsConstraint } from './validators/menu-positions-exists';

@Module({
  imports: [TypeOrmModule.forFeature([MenuPosition]), DishModule],
  controllers: [MenuPositionController],
  providers: [MenuPositionService, IsMenuPositionsExistsConstraint],
})
export class MenuPositionModule {}
