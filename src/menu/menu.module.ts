import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { Menu } from './menu.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { MenuPosition } from 'src/menu-position/menu-position.entity';
import { MenuPositionModule } from 'src/menu-position/menu-position.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu]),
    TypeOrmModule.forFeature([MenuPosition]),
    UserModule,
    MenuPositionModule,
  ],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
