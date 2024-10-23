import { Controller, Get, NotFoundException, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserOwnInfoDto } from './dto/user-own-info.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @Roles('client', 'admin', 'menuModerator', 'orderIssuing', 'deliveryman')
  async getUserInfo(@Req() req) {
    const { office, user, employee } = await this.userService.getUserFullInfo({
      id: req.user.userId,
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return new UserOwnInfoDto(user, office, employee);
  }
}
