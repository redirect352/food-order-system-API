import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { CryptoService } from '../../lib/helpers/crypto/crypto.service';
import { UpdateCredentialsDto } from './dto/update-credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    @Inject('FirstAuthJwtService')
    private readonly firstTimeJwtService: JwtService,
  ) {}
  async validateUser(
    { login, email }: { login?: string; email?: string },
    password: string,
  ) {
    if (!login && !email) return null;
    const user = login
      ? await this.userService.findByLogin(login)
      : await await this.userService.findUser({ email });
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
}
