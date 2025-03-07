import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalLoginStrategy extends PassportStrategy(
  Strategy,
  'local-login',
) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'login' });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(
      { login: username },
      password,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
