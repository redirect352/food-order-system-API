import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { PasswordResetStrategy } from './strategies/password-reset.strategy';
import { UserService } from 'src/user/user.service';
import { TimeCheckerService } from 'src/lib/helpers/time-checker/time-checker.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateCredentialsDto } from './dto/update-credentials.dto';
import { CheckEmployeeDto } from './dto/check-employee.dto';
import { EmployeeService } from 'src/employee/employee.service';
import { SignUpDto } from './dto/sign-up.dto';
import { user } from '@prisma/client';
import { CheckFirstAuthResponseDto } from './dto/check-first-auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly employeeService: EmployeeService,
    private passwordResetStrategy: PasswordResetStrategy,
    private readonly timeCheckerService: TimeCheckerService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  async signIn(@Req() req, @Res() res) {
    const user: user = req.user;
    if (user.isPasswordTemporary) {
      await this.authService.sendVerificationEmailToUser(user, req, res);
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
    const authData = await this.userService.getUserAuthData({
      email: resetPasswordDto.email,
      login: resetPasswordDto.login,
    });
    if (!authData) {
      throw new NotFoundException(
        'Пользователь с указанными данными не найден',
      );
    }
    const { user } = authData;
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
      req.user.id,
      changePasswordDto.newPassword,
    );
    if (updateResult) {
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
    const updated = await this.authService.changeUserCredentials(
      user.id,
      updateUserDto,
    );
    if (updated) {
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
    const user: user = req.user;
    await this.userService.updateUserById(user.id, {
      isPasswordTemporary: false,
    });
    const employee = await this.employeeService.findEmployeeById(
      user.employeeId,
    );
    return {
      user: new CheckFirstAuthResponseDto(user, employee),
      statusCode: 200,
    };
  }
  @Get('/sign-up/check-employee')
  async checkOnRegister(@Query() checkEmployeeDto: CheckEmployeeDto) {
    return await this.employeeService.checkEmployeeCanRegister(
      checkEmployeeDto,
    );
  }
  @Post('/sign-up/')
  async registerUser(@Body() signUpDto: SignUpDto, @Req() req, @Res() res) {
    const user = await this.authService.register(signUpDto);
    return await this.authService.sendVerificationEmailToUser(user, req, res);
  }
}
