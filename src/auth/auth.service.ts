import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { CryptoService } from '../lib/helpers/crypto/crypto.service';
import { UpdateCredentialsDto } from './dto/update-credentials.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { ValidateEmailStrategy } from './strategies/validate-email.strategy';
import e from 'express';
import { user } from '@prisma/client';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    @Inject('FirstAuthJwtService')
    private readonly firstTimeJwtService: JwtService,
    private validateEmailStrategy: ValidateEmailStrategy,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}
  async validateUser(
    { login, email }: { login?: string; email?: string },
    password: string,
  ) {
    if (!login && !email) return null;
    const authData = await this.userService.getUserAuthData({
      login,
      email,
    });
    if (!authData) throw new ForbiddenException();
    const { user, active } = authData;
    if (
      user &&
      active &&
      (await this.cryptoService.comparePassword(password, user.password))
    ) {
      if (user.isPasswordTemporary) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userRes } = user;
        return userRes;
      }
      return {
        role: user.role,
        id: user.id,
      };
    }
    return null;
  }

  async login(user: user, req: e.Request, res: e.Response) {
    if (user.isPasswordTemporary) {
      await this.sendVerificationEmailToUser(user, req, res);
      return;
    }
    const payload = {
      id: user.id,
      role: user.role,
    };
    const refreshToken = await this.jwtService.signAsync(
      payload,
      this.refreshTokenConfig,
    );
    const refreshTokenHash = await argon2.hash(refreshToken);
    await this.userService.updateUserById(user.id, {
      refreshTokenHash,
    });
    res.status(200);
    res.send({
      role: user.role,
      refresh_token: refreshToken,
      access_token: await this.jwtService.signAsync({
        ...payload,
        hash: refreshTokenHash.slice(-30),
      }),
      statusCode: 200,
    });
  }

  async logout(id: number) {
    await this.userService.updateUserById(id, {
      refreshTokenHash: null,
    });
  }

  async generateFirstAuthToken(user: { id: number }) {
    const payload = { id: user.id };
    return {
      access_token: await this.firstTimeJwtService.signAsync(payload),
    };
  }

  async changeUserCredentials(id: number, user: UpdateCredentialsDto) {
    return await this.userService.updateUserById(id, {
      password: await this.cryptoService.hashPassword(user.newPassword),
      login: user.newLogin,
      isPasswordTemporary: false,
    });
  }
  async register(signUpDto: SignUpDto) {
    return await this.userService.register({
      ...signUpDto,
      password: await this.cryptoService.hashPassword(signUpDto.password),
    });
  }
  async sendVerificationEmailToUser(
    user: user,
    req: e.Request,
    res: e.Response,
  ) {
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
      await this.validateEmailStrategy.send(req, res);
      return;
    } else {
      throw new ForbiddenException('Аккаунт пользователя уже активирован');
    }
  }
  async refreshAccessToken(user: user) {
    const payload = {
      id: user.id,
      role: user.role,
    };
    return {
      role: user.role,
      access_token: await this.jwtService.signAsync({
        ...payload,
        hash: user.refreshTokenHash.slice(-30),
      }),
      statusCode: 200,
    };
  }
}
