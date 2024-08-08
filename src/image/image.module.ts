import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image as Image } from './image.entity';
import { UserModule } from 'src/user/user.module';
import { IsImageExistsConstraint } from './validators/image-exists.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Image]), UserModule],
  providers: [ImageService, IsImageExistsConstraint],
  controllers: [ImageController],
})
export class ImageModule {}
