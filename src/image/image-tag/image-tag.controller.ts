import { Controller, Get, Query } from '@nestjs/common';
import { ImageTagService } from './image-tag.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SearchImageTagDto } from './dto/search-image-tags.dto';

@Roles('menu_moderator', 'admin')
@Controller('image-tag')
export class ImageTagController {
  constructor(private readonly imageTagService: ImageTagService) {}
  @Get('/search')
  async searchImageTags(@Query() searchImageTags: SearchImageTagDto) {
    return this.imageTagService.searchImageTags(searchImageTags);
  }
}
