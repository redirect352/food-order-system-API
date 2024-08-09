import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Menu } from './menu.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMenuDto } from './dto/create-menu.dto';
import { BranchOffice } from 'src/branch-office/branch-office.entity';
import { MenuPosition } from 'src/menu-position/menu-position.entity';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import * as _ from 'lodash';
import { GetUserMenuDto } from './dto/get-user-menu.dto';
import { MenuPositionService } from 'src/menu-position/menu-position.service';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    // @InjectRepository(MenuPosition)
    // private readonly menuPositionRepository: Repository<MenuPosition>,
    private readonly menuPositionService: MenuPositionService,
    private readonly userService: UserService,
  ) {}

  async createMenu(createMenuDto: CreateMenuDto, userId?: number) {
    const menu = new Menu();
    menu.expire = createMenuDto.expire;
    menu.relevantFrom = createMenuDto.relevantFrom;
    menu.providingCanteen = {
      ...new BranchOffice(),
      id: createMenuDto.providingCanteenId,
    };
    menu.menuPositions = createMenuDto.menuPositions.map((id) => ({
      id,
      ...new MenuPosition(),
    }));
    if (userId) {
      menu.author = { ...new User(), id: userId };
    }
    menu.name = createMenuDto.name ?? `Меню ${new Date().toISOString()}`;
    const res = await this.menuRepository.save(menu);
    return res;
  }

  async getActualMenuForUser(getUserMenuDto: GetUserMenuDto, userId?: number) {
    if (!userId) throw new UnauthorizedException();
    const canteenId = await this.userService.findUserServingCanteen(userId);
    const menuList = await this.menuPositionService.getActual(
      canteenId,
      getUserMenuDto,
    );
    if (!menuList) return [];
    else {
      return menuList.map((item) =>
        _.omit(item, [
          'dish.providingCanteen.id',
          'dish.providingCanteen.address',
          'dish.image.id',
        ]),
      );
    }
  }
}
