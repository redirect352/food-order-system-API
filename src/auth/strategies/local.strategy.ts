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
    if (user.id) return user;
    const res = user as any;
    if (res.employeeActive === false) {
      throw new UnauthorizedException(
        'Ваш аккаунт заблокирован в связи с увольнением',
      );
    }
    if (res.officeActive === false) {
      throw new UnauthorizedException(
        'Сотрудникам вашего филиала вход в систему закрыт',
      );
    }
    throw new UnauthorizedException(
      'Ошибка авторизации неверный логин или пароль',
    );
  }
}
