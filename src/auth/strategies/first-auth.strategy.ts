import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FirstAuthStrategy extends PassportStrategy(
  Strategy,
  'first-auth',
) {
  constructor(
    private configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_FIRST_AUTH_SECRET_KEY'),
    });
  }

  async validate(payload: any) {
    const dbUser = await this.userService.findById(payload.id);
    if (!dbUser || !dbUser.isPasswordTemporary) {
      throw new UnauthorizedException();
    }
    return { id: payload.id };
  }
}
