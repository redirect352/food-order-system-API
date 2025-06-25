import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateMenuDto } from './dto/create-menu.dto';
import { GetUserMenuDto } from './dto/get-user-menu.dto';
import { MenuParserService } from '../lib/utils/menu-parser/menu-parser.service';
import { CreateMenuFromDocxDto } from './dto/create-menu-from-docx.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenuListDto } from './dto/menu-list.dto';
import { GetMenuByIdDto } from './dto/get-menu-by-id.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Roles('client')
@Controller('menu')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly menuParserService: MenuParserService,
  ) {}

  @Roles('admin')
  @Post('/create')
  async createMenu(@Req() req, @Body() createMenuDto: CreateMenuDto) {
    return this.menuService.createMenu(createMenuDto, req.user?.userId);
  }

  @Roles('admin', 'menu_moderator')
  @Post('/create/from-file/word')
  @UseInterceptors(FileInterceptor('file'))
  async createMenuFromWordFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 1000 * 1000 * 2,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body() createMenuFromDocxDto: CreateMenuFromDocxDto,
    @Req() req,
  ) {
    const { expire, relevantFrom } = createMenuFromDocxDto;
    const menuDeclaration = await this.menuParserService.parseMenuFile(file);
    if (expire) menuDeclaration.expire = expire;
    if (relevantFrom) menuDeclaration.relevantFrom = relevantFrom;
    try {
      const menu = await this.menuService.createMenuWithPositions(
        menuDeclaration,
        {
          authorId: +req.user.userId,
          providingCanteenId: createMenuFromDocxDto.providingCanteenId,
          servedOfficesIds: createMenuFromDocxDto.servedOffices,
        },
      );
      return { menu };
    } catch (error) {
      console.log(error);
      throw new BadRequestException();
    }
  }
  @Roles('admin', 'menu_moderator')
  @Get('/list')
  async getMenuList(@Query() getMenuListDto: GetUserMenuDto) {
    const result = await this.menuService.getMenuListDto(getMenuListDto);
    return new MenuListDto(result, getMenuListDto);
  }

  @Get('/actual')
  async getUserMenu(@Req() req, @Query() getUserMenuDto: GetUserMenuDto) {
    const menu = await this.menuService.getActualMenuForUser(
      getUserMenuDto,
      req.user.userId,
    );
    return menu;
  }

  @Get('/actual/menu-categories')
  async getMenuCategories(@Req() req) {
    return await this.menuService.getActualMenuCategories(req.user.userId);
  }

  @Roles('admin', 'menu_moderator')
  @Get('/:id')
  async getMenuById(@Param() { id }: GetMenuByIdDto) {
    return await this.menuService.getMenuById(id);
  }

  @Roles('menu_moderator')
  @Patch('/:id')
  async updateMenu(
    @Param() { id }: GetMenuByIdDto,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return await this.menuService.updateMenu(id, updateMenuDto);
  }
}
