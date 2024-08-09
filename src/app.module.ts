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
import { ConfigModule } from '@nestjs/config';
import { CryptoModule } from '../lib/helpers/crypto/crypto.module';
import { EmailBuilderModule } from '../lib/helpers/email-builder/email-builder.module';
import { DishModule } from './dish/dish.module';
import { MenuPositionModule } from './menu-position/menu-position.module';
import { MenuModule } from './menu/menu.module';
import { DishCategoryModule } from './dish-category/dish-category.module';

console.log(join(__dirname, '..', '..', 'static'));

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'food-order-system',
      autoLoadEntities: true,
      synchronize: true,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
