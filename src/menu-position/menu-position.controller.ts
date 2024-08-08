import { Body, Controller, Post } from '@nestjs/common';
import { MenuPositionService } from './menu-position.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateMenuPositionDto } from './dto/create-menu-position.dto';

@Roles('admin', 'client')
@Controller('menu-position')
export class MenuPositionController {
  constructor(private readonly menuPositionService: MenuPositionService) {}
  @Post('create')
  async createMenuPosition(
    @Body() createMenuPositionDto: CreateMenuPositionDto,
  ) {
    return this.menuPositionService.createMenuPosition(createMenuPositionDto);
  }
}
