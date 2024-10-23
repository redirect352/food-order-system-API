import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { UserModule } from 'src/user/user.module';
import { MenuPositionModule } from 'src/menu-position/menu-position.module';
import { DatabaseModule } from '../database/database.module';
import { MenuParserModule } from '../lib/utils/menu-parser/menu-parser.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { BranchOfficeModule } from '../branch-office/branch-office.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    MenuPositionModule,
    MenuParserModule,
    NestjsFormDataModule,
    BranchOfficeModule,
  ],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
