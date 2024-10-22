import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UserService } from 'src/user/user.service';
import { GetUserMenuDto } from './dto/get-user-menu.dto';
import { MenuPositionService } from 'src/menu-position/menu-position.service';
import { MenuPositionItem } from './dto/menu-position-item.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MenuService {
  constructor(
    private readonly menuPositionService: MenuPositionService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async createMenu(createMenuDto: CreateMenuDto, userId?: number) {
    const { menuPositions, servedOffices } = createMenuDto;
    const result = await this.prismaService.menu.create({
      data: {
        name: createMenuDto.name ?? `Меню ${new Date().toISOString()}`,
        relevantFrom: createMenuDto.relevantFrom,
        expire: createMenuDto.expire,
        authorId: userId,
        providingCanteenId: createMenuDto.providingCanteenId,
        menu_positions: {
          connect: menuPositions.map((id) => ({
            id,
          })),
        },
        served_offices: {
          connect: servedOffices.map((id) => ({ id })),
        },
      },
    });
    return result;
  }

  async getActualMenuForUser(getUserMenuDto: GetUserMenuDto, userId?: number) {
    if (!userId) throw new UnauthorizedException();
    const office = await this.userService.getUserOffice(userId);
    const menuList = await this.menuPositionService.getActual(
      office.id,
      getUserMenuDto,
    );
    if (!menuList.items)
      return {
        items: [],
      };
    else {
      return {
        page: getUserMenuDto.page,
        totalPages: menuList.pages,
        items: menuList.items.map((item) => new MenuPositionItem(item)),
      };
    }
  }

  async getActualMenuCategories(userId?: number) {
    if (!userId) throw new UnauthorizedException();
    const userOffice = await this.userService.getUserOffice(userId);
    return this.menuPositionService.getActualCategories(userOffice.id);
  }
}
