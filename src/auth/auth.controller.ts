import {
  BadRequestException,
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
import { User } from 'src/user/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private validateEmailStrategy: ValidateEmailStrategy,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async signIn(@Req() req, @Res() res) {
    const user: User = req.user;
    if (user.isPasswordTemporary) {
      console.log(user);
      console.log(new Date(), user.verificationEmailSendTime);
      if (
        user.verificationEmailSendTime &&
        new Date().getTime() - user.verificationEmailSendTime.getTime() <=
          1000 * 60 * 5
      ) {
        throw new BadRequestException(
          'Повторная отправка письма активации возможна только через 5 минут после прошлой попытки',
        );
      }
      req.body.destination = user.email;
      req.body.id = user.id;
      delete req.body.password;
      delete req.body.login;
      this.validateEmailStrategy.send(req, res);
      return;
    }
    const result = await this.authService.login(req.user);
    res.status(200);
    res.send(result);
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
