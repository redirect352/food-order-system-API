import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { IsImageExistsConstraint } from './validators/image-exists.validator';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ImageTagModule } from './image-tag/image-tag.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule, ImageModule],
      useFactory: async (
        configService: ConfigService,
        imageService: ImageService,
      ) => ({
        storage: multer.diskStorage({
          destination: configService.get('DISH_IMAGES_SAVE_PATH'),
          filename: imageService.getImageSaveName,
        }),
      }),
      inject: [ConfigService, ImageService],
    }),
    ImageTagModule,
  ],
  providers: [ImageService, IsImageExistsConstraint],
  controllers: [ImageController],
  exports: [ImageService],
})
export class ImageModule {}
