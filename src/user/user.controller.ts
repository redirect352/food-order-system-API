import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserOwnInfoDto } from './dto/user-own-info.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { GetUserMainInfoDto } from './dto/get-user-main-info.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @Roles('client', 'admin', 'menu_moderator', 'order_issuing', 'deliveryman')
  async getUserInfo(@Req() req) {
    const { office, user, employee } = await this.userService.getUserFullInfo({
      id: req.user.userId,
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return new UserOwnInfoDto(user, office, employee);
  }

  @Get('/search')
  @Roles('admin')
  async searchUsers(@Query() searchUsersDto: SearchUsersDto) {
    return await this.userService.searchUsersIds(searchUsersDto);
  }

  @Get('/main-info/:id')
  @Roles('admin')
  async getUserMainInfo(@Param() { id }: GetUserMainInfoDto) {
    return await this.userService.getUserMainInfo(id);
  }

  @Patch('/update/:id')
  @Roles('admin')
  async updateUserData(
    @Param() { id }: GetUserMainInfoDto,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.updateUser(id, updateUserDto);
    return { id: user.id, message: 'Данные пользователя обновлены' };
  }
}
