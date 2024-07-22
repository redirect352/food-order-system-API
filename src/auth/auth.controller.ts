import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ValidateEmailStrategy } from './strategies/validate-email.strategy';
import { AuthGuard } from '@nestjs/passport';
import { updateUserDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private validateEmailStrategy: ValidateEmailStrategy,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async signIn(@Req() req, @Res({ passthrough: true }) res) {
    const user = req.user;
    if (user.isPasswordTemporary) {
      req.body.destination = user.email;
      req.body.id = user.id;
      delete req.body.password;
      delete req.body.login;
      return this.validateEmailStrategy.send(req, res);
    }
    const result = await this.authService.login(req.user);
    return result;
  }

  @UseGuards(AuthGuard('magiclogin'))
  @Get('/callback')
  callback(@Req() req) {
    return this.authService.generateFirstAuthToken(req.user);
  }

  @Post('/changeCredentials')
  @UseGuards(AuthGuard('firstAuth'))
  async changeAuthInfo(@Req() req, @Body() updateUserDto: updateUserDto) {
    const user = req.user;
    console.log(user);
    return this.authService.changeUserCredentials(user.id, updateUserDto);
  }
}
