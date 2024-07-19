import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { CryptoService } from './crypto/crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
  ) {}
  async validateUser(login: string, password: string) {
    const user = await this.userService.findByLogin(login);
    if (
      user &&
      (await this.cryptoService.comparePassword(password, user.password))
    ) {
      return { role: user.role, id: user.id };
    }
    // const payload = { role: user.role, id: user.id };
    // return {
    //   access_token: await this.jwtService.signAsync(payload),
    // };
    return null;
  }

  async login(user: { id: number; role: string }) {
    const payload = { id: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
