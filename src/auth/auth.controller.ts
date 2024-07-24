import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ValidateEmailStrategy } from './strategies/validate-email.strategy';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto, ResetPasswordDto, UpdateUserDto } from './auth.dto';
import { User } from 'src/user/user.entity';
import { PasswordResetStrategy } from './strategies/password-reset.strategy';
import { UserService } from 'src/user/user.service';
import { TimeCheckerService } from 'helpers/time-checker/time-checker.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private validateEmailStrategy: ValidateEmailStrategy,
    private passwordResetStrategy: PasswordResetStrategy,
    private readonly timeCheckerService: TimeCheckerService,
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
      console.log(req);
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

  @Post('/queryPasswordReset')
  async queryPassRestore(
    @Req() req,
    @Res() res,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const user = await this.userService.findUser({
      email: resetPasswordDto.email,
      login: resetPasswordDto.login,
    });
    if (!user) {
      throw new NotFoundException(
        'Пользователь с указанными данными не найден',
      );
    }
    if (
      this.timeCheckerService.isTimeInIntervalFromNow(
        user.lastPasswordResetTime,
        5,
        'm',
      )
    ) {
      throw new BadRequestException(
        'Повторная отправка письма сброса пароля возможна только через 5 минут после прошлой попытки',
      );
    }
    req.body = {
      destination: user.email,
      id: user.id,
      hash: user.password.substring(0, 10),
    };
    return this.passwordResetStrategy.send(req, res);
  }

  @UseGuards(AuthGuard('changepassword'))
  @Post('/resetPassword')
  async changePassword(
    @Req() req,
    @Res({ passthrough: true }) res,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const updateResult = await this.userService.updateUserPassword(
      { id: req.user.id },
      changePasswordDto.newPassword,
    );
    if (updateResult.affected > 0) {
      return {
        message: 'Пароль успешно изменен',
      };
    }
    res.status(304);
    return {
      message: 'Пароль не изменен',
    };
  }

  @Post('/changeCredentials')
  @UseGuards(AuthGuard('firstAuth'))
  async changeAuthInfo(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const user = req.user;
    return this.authService.changeUserCredentials(user.id, updateUserDto);
  }
}
