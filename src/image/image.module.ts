import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { UserModule } from 'src/user/user.module';
import { IsImageExistsConstraint } from './validators/image-exists.validator';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserModule, DatabaseModule, ConfigModule],
  providers: [ImageService, IsImageExistsConstraint],
  controllers: [ImageController],
  exports: [ImageService],
})
export class ImageModule {}
