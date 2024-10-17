import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { UserModule } from 'src/user/user.module';
import { MenuPositionModule } from 'src/menu-position/menu-position.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, UserModule, MenuPositionModule],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
