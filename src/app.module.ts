import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ImageModule } from './image/image.module';
import { UserModule } from './user/user.module';
import { BranchOfficeModule } from './branch-office/branch-office.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptoModule } from '../lib/helpers/crypto/crypto.module';
import { EmailBuilderModule } from '../lib/helpers/email-builder/email-builder.module';
import { DishModule } from './dish/dish.module';
import { MenuPositionModule } from './menu-position/menu-position.module';
import { MenuModule } from './menu/menu.module';
import { DishCategoryModule } from './dish-category/dish-category.module';
import { OrderStatusModule } from './order/order-status/order-status.module';
import { OrderModule } from './order/order.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'static'),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
