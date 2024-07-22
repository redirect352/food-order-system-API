// magiclogin.strategy.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-magic-login';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ValidateEmailStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(ValidateEmailStrategy.name);

  constructor(private readonly userService: UserService) {
    super({
      secret: 'your-secret', // get this from env vars
      jwtOptions: {
        expiresIn: '5m',
      },
      callbackUrl: 'http://localhost:5000/api/auth/callback',
      sendMagicLink: async (destination, href) => {
        this.logger.debug(`sending email to ${destination} with Link ${href}`);
      },
      verify: async (payload, callback) =>
        callback(null, this.validate(payload)),
    });
  }

  async validate(payload: any) {
    const dbUser = await this.userService.findById(payload.id);
    if (!dbUser || !dbUser.isPasswordTemporary) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
