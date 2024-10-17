import { Module } from '@nestjs/common';
import { MenuPositionService } from './menu-position.service';
import { MenuPositionController } from './menu-position.controller';
import { DishModule } from 'src/dish/dish.module';
import { IsMenuPositionsExistsConstraint } from './validators/menu-positions-exists';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DishModule, DatabaseModule, UserModule],
  controllers: [MenuPositionController],
  providers: [MenuPositionService, IsMenuPositionsExistsConstraint],
  exports: [MenuPositionService],
})
export class MenuPositionModule {}
