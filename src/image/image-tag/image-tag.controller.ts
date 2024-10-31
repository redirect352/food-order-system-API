import { Controller, Get } from '@nestjs/common';
import { ImageTagService } from './image-tag.service';
import { Roles } from '../../auth/decorators/roles.decorator';

@Roles('menu_moderator', 'admin')
@Controller('image-tag')
export class ImageTagController {
  constructor(private readonly imageTagService: ImageTagService) {}
  @Get()
  async getImageTags() {
    return this.imageTagService.getImageTags();
  }
}
