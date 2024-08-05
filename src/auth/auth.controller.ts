import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ValidateEmailStrategy } from './strategies/validate-email.strategy';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/user.entity';
import { PasswordResetStrategy } from './strategies/password-reset.strategy';
import { UserService } from 'src/user/user.service';
import { TimeCheckerService } from 'lib/helpers/time-checker/time-checker.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateCredentialsDto } from './dto/update-credentials.dto';

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
  @Post('/sign-in')
  async signIn(@Req() req, @Res() res) {
    const user: User = req.user;
    if (user.isPasswordTemporary) {
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
    res.send({ ...result, statusCode: 200 });
  }

  @Post('/reset-password')
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

  @UseGuards(AuthGuard('change-password'))
  @Patch('/change-password')
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

  @UseGuards(AuthGuard('magic-login'))
  @Patch('/change-credentials')
  async changeAuthInfo(
    @Req() req,
    @Body() updateUserDto: UpdateCredentialsDto,
  ) {
    const user = req.user;
    const res = await this.authService.changeUserCredentials(
      user.id,
      updateUserDto,
    );
    if (res.affected === 1) {
      return { statusCode: 200 };
    } else {
      throw new NotFoundException(
        'Пользователь не найден! Ошибка изменения пароля',
      );
    }
  }

  @UseGuards(AuthGuard('magic-login'))
  @Get('/check-first-auth-token')
  async checkFirstAuthToken(@Req() req) {
    const user: User = req.user;
    return {
      user: {
        name: {
          firstName: user.firstName,
          lastName: user.lastName,
          patronymic: user.patronymic,
        },
        login: user.login,
      },
      statusCode: 200,
    };
  }
}
