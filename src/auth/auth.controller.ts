import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signIn(@Req() req) {
    return this.authService.login(req.user);
  }
}
