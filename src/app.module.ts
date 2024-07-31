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
      rootPath: join(__dirname, '..', 'static'),
    }),
    ImageModule,
    UserModule,
    BranchOfficeModule,
    AuthModule,
    ConfigModule.forRoot(),
    CryptoModule,
    EmailBuilderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
