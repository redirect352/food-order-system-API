import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UserService } from 'src/user/user.service';
import { GetUserMenuDto } from './dto/get-user-menu.dto';
import { MenuPositionService } from 'src/menu-position/menu-position.service';
import { MenuPositionItem } from './dto/menu-position-item.dto';
import { PrismaService } from '../database/prisma.service';
import { menuDeclaration } from '../lib/utils/menu-parser/menu-parser.interface';
import { BranchOfficeService } from '../branch-office/branch-office.service';
import { GetMenuListDto } from './dto/get-menu-list.dto';
import * as dayjs from 'dayjs';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    private readonly menuPositionService: MenuPositionService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly branchOfficeService: BranchOfficeService,
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

  async createMenuWithPositions(
    menuDeclaration: menuDeclaration,
    extraInfo: {
      authorId?: number;
      providingCanteenId?: number;
      servedOfficesIds?: number[];
    },
  ) {
    const {
      name,
      relevantFrom,
      expire,
      providingCanteenName,
      served_offices,
      menuPositions,
    } = menuDeclaration;
    const { authorId } = extraInfo;
    let { providingCanteenId, servedOfficesIds } = extraInfo;
    if (!providingCanteenId) {
      providingCanteenId = (
        await this.branchOfficeService.getBranchOffice({
          name: providingCanteenName,
        })
      ).id;
      if (!providingCanteenId)
        throw new BadRequestException(
          'Некорректно указана столовая предоставляющая меню',
        );
    }
    if (!servedOfficesIds || servedOfficesIds.length === 0) {
      servedOfficesIds =
        await this.branchOfficeService.getBranchOfficesIdsByNames(
          served_offices,
        );
      if (!servedOfficesIds || servedOfficesIds.length === 0)
        throw new BadRequestException(
          'Не указаны филиалы, для которых меню доступно',
        );
    }
    const menuPositionsList =
      await this.menuPositionService.findOrCreateMenuPositions(
        menuPositions,
        providingCanteenId,
      );

    return await this.prismaService.menu.create({
      data: {
        name: name ?? `Меню ${dayjs().format('DD.MM.YYYY HH:mm')}`,
        relevantFrom,
        expire,
        authorId,
        providingCanteenId,
        menu_positions: {
          connect: menuPositionsList.map(({ id }) => ({ id })),
        },
        served_offices: {
          connect: servedOfficesIds.map((id) => ({ id })),
        },
      },
    });
  }

  async getActualMenuForUser(getUserMenuDto: GetUserMenuDto, userId?: number) {
    if (!userId) throw new UnauthorizedException();
    const menuList = await this.menuPositionService.getActual(getUserMenuDto);
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

  async getMenuListDto(getMenuListDto: GetMenuListDto) {
    const { destinationOfficeId, page, pageSize } = getMenuListDto;
    const count = await this.prismaService.menu.count({
      where: {
        served_offices: { some: { id: destinationOfficeId } },
      },
    });
    const menuList = await this.prismaService.menu.findMany({
      include: {
        _count: true,
        providingCanteen_office: true,
        user: { select: { employee: true } },
      },
      where: {
        served_offices: { some: { id: destinationOfficeId } },
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { created: 'desc' },
    });
    return {
      count,
      menuList,
    };
  }

  async getMenuById(id: number) {
    const result = await this.prismaService.menu.findUnique({
      omit: { authorId: true, providingCanteenId: true },
      include: {
        _count: true,
        providingCanteen_office: { omit: { servingCanteenId: true } },
        user: {
          select: {
            employee: { omit: { active: true, officeId: true, id: true } },
          },
        },
        menu_positions: {
          omit: { dishId: true },
          include: {
            dish: {
              include: { providingCanteen: true, dish_category: true },
              omit: { providingCanteenId: true, categoryId: true },
            },
          },
        },
      },
      where: { id },
    });
    result.menu_positions.forEach((pos) => {
      (pos.dish as any).category = pos.dish.dish_category;
      pos.dish.dish_category = undefined;
    });
    return result;
  }

  async updateMenu(id: number, updateMenuDto: UpdateMenuDto) {
    return this.prismaService.menu.update({
      where: { id },
      data: {
        ...updateMenuDto,
      },
    });
  }
  async deleteMenu(id: number) {
    return this.prismaService.menu.delete({ where: { id } });
  }
}
