import { Injectable } from '@nestjs/common';
import { Menu } from './menu.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMenuDto } from './dto/create-menu.dto';
import { BranchOffice } from 'src/branch-office/branch-office.entity';
import { MenuPosition } from 'src/menu-position/menu-position.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async createMenu(createMenuDto: CreateMenuDto) {
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
    const res = await this.menuRepository.save(menu);
    return res;
  }
}
