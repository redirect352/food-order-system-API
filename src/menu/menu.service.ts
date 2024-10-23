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
        name: name ?? `Меню ${new Date().toISOString()}`,
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
