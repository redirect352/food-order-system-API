import { BranchOfficeMainInfoDto } from '../../branch-office/dto/branch-office-main-info.dto';
import { EmployeeInfoDto } from '../../employee/dto/employee-info.dto';
import { GetMenuListDto } from './get-menu-list.dto';

export class MenuListDto {
  public page: number;
  public totalPages: number;
  public menuList: MenuListItem[];
  constructor(
    menu: { count: number; menuList: any[] },
    getMenuListDto: GetMenuListDto,
  ) {
    const { count, menuList } = menu;
    this.page = getMenuListDto.page;
    this.totalPages = Math.ceil(count / (getMenuListDto.pageSize ?? 1));
    this.menuList = menuList.map((item) => ({
      id: item.id,
      name: item.name,
      relevantFrom: item.relevantFrom,
      expire: item.expire,
      menuPositionsCount: item._count.menu_positions,
      author: new EmployeeInfoDto(item.user.employee),
      providingCanteen: new BranchOfficeMainInfoDto(
        item.providingCanteen_office,
      ),
      created: item.created,
    }));
  }
}

type MenuListItem = {
  id: number;
  name: number;
  relevantFrom: Date;
  expire: Date;
  menuPositionsCount: number;
  author: EmployeeInfoDto;
  providingCanteen: BranchOfficeMainInfoDto;
  created: Date;
};
