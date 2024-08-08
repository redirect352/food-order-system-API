import { Body, Controller, Post } from '@nestjs/common';
import { MenuService } from './menu.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateMenuDto } from './dto/create-menu.dto';

@Roles('admin', 'client')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}
  @Post('/create')
  async createMenu(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.createMenu(createMenuDto);
  }
}
