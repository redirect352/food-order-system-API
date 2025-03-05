import { Module } from '@nestjs/common';
import { ImageTagService } from './image-tag.service';
import { ImageTagController } from './image-tag.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ImageTagController],
  providers: [ImageTagService],
  exports: [ImageTagService],
})
export class ImageTagModule {}
