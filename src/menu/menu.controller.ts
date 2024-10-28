import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
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
}
