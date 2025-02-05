import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ImageModule } from './image/image.module';
import { UserModule } from './user/user.module';
import { BranchOfficeModule } from './branch-office/branch-office.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CryptoModule } from './lib/helpers/crypto/crypto.module';
import { EmailBuilderModule } from './lib/helpers/email-builder/email-builder.module';
import { DishModule } from './dish/dish.module';
import { MenuPositionModule } from './menu-position/menu-position.module';
import { MenuModule } from './menu/menu.module';
import { DishCategoryModule } from './dish-category/dish-category.module';
import { OrderStatusModule } from './order/order-status/order-status.module';
import { OrderModule } from './order/order.module';
import { EmployeeModule } from './employee/employee.module';
import { DatabaseModule } from './database/database.module';
import { ImageTagModule } from './image/image-tag/image-tag.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: process.env.STATIC_PATH,
    }),
    ImageModule,
    UserModule,
    BranchOfficeModule,
    AuthModule,
    ConfigModule.forRoot(),
    CryptoModule,
    EmailBuilderModule,
    DishModule,
    MenuPositionModule,
    MenuModule,
    DishCategoryModule,
    OrderStatusModule,
    OrderModule,
    EmployeeModule,
    DatabaseModule,
    ImageTagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
