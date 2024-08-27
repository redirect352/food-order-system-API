import { Controller, Get, NotFoundException, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserInfoDto } from './dto/user-info.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @Roles('client', 'admin', 'menuModerator', 'orderIssuing', 'deliveryman')
  async getUserInfo(@Req() req) {
    const user = await this.userService.findUser({ id: req.user.id });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return new UserInfoDto(user);
  }
}
