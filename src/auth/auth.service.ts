import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { CryptoService } from '../../lib/helpers/crypto/crypto.service';
import { UpdateCredentialsDto } from './dto/update-credentials.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { User } from 'src/user/user.entity';
import { ValidateEmailStrategy } from './strategies/validate-email.strategy';
import e from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    @Inject('FirstAuthJwtService')
    private readonly firstTimeJwtService: JwtService,
    private validateEmailStrategy: ValidateEmailStrategy,
  ) {}
  async validateUser(
    { login, email }: { login?: string; email?: string },
    password: string,
  ) {
    if (!login && !email) return null;
    const user = await await this.userService.findUser({
      login,
      email,
      employeeBasicData: { active: true },
    });
    if (
      user &&
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

  async login(user: { id: number; role: string }) {
    const payload = { id: user.id, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
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
    user: User,
    req: e.Request,
    res: e.Response,
  ) {
    if (user.isPasswordTemporary) {
      if (
        user.verificationEmailSendTime &&
        new Date().getTime() - user.verificationEmailSendTime.getTime() <=
          1000 * 60 * 5
      ) {
        // res.status(400);
        // res.send({ message: '2121' });
        // return;
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
    } else {
      throw new ForbiddenException('Аккаунт пользователя уже активирован');
    }
  }
}
