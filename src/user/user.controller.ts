import { Controller, Get, NotFoundException, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @Roles('client', 'admin', 'menuModerator', 'orderIssuing', 'deliveryman')
  async getUserInfo(@Req() req) {
    const user = await this.userService.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    console.log(user);
    console.log(user.office);
    const result = Object.fromEntries(
      Object.entries(user).filter(([key]) =>
        [
          'id',
          'firstName',
          'lastName',
          'patronymic',
          'personnelNumber',
          'email',
          'office',
        ].includes(key),
      ),
    );
    result.office.isCanteen = undefined;
    return result;
  }
}
