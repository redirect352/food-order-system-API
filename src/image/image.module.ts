import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { UserModule } from 'src/user/user.module';
import { IsImageExistsConstraint } from './validators/image-exists.validator';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [UserModule, DatabaseModule],
  providers: [ImageService, IsImageExistsConstraint],
  controllers: [ImageController],
})
export class ImageModule {}
