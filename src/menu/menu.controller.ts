import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { MenuService } from './menu.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateMenuDto } from './dto/create-menu.dto';
import { GetUserMenuDto } from './dto/get-user-menu.dto';

@Roles('client')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Roles('admin', 'client')
  @Post('/create')
  async createMenu(@Req() req, @Body() createMenuDto: CreateMenuDto) {
    return this.menuService.createMenu(createMenuDto, req.user?.userId);
  }

  @Get('/actual')
  async getUserMenu(@Req() req, @Query() getUserMenuDto: GetUserMenuDto) {
    console.log(getUserMenuDto);
    const menu = await this.menuService.getActualMenuForUser(
      getUserMenuDto,
      req.user.userId,
    );
    return menu;
  }
}
