// magiclogin.strategy.ts
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-magic-login';
import { EmailBuilderService } from 'lib/helpers/email-builder/email-builder.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PasswordResetStrategy extends PassportStrategy(
  Strategy,
  'change-password',
) {
  private readonly logger = new Logger(PasswordResetStrategy.name);

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly mailService: MailerService,
    mailBuilderService: EmailBuilderService,
  ) {
    super({
      secret: configService.get<string>('PASSWORD_RESET_SECRET'),
      userFields: ['id', 'login'],
      jwtOptions: {
        expiresIn: configService.get<string>('PASSWORD_RESET_EXPIRE'),
      },
      callbackUrl: `${configService.get<string>('BASE_URL')}/api/auth/passwordReset`,
      sendMagicLink: async (destination, href) => {
        this.mailService.sendMail({
          from: 'Система заказа питания <noreply.sales@minsktrans.by>',
          to: destination,
          subject: `Восстановление пароля`,
          html: await mailBuilderService.fillPasswordResetTemplate({
            RESET_LINK: href,
          }),
        });
        await userService.updateUser(
          { email: destination },
          { lastPasswordResetTime: new Date() },
        );
        this.logger.debug(`sending email to ${destination} with Link ${href}`);
      },
      verify: async (payload, callback) =>
        callback(null, this.validate(payload)),
    });
  }

  async validate(payload: any) {
    const dbUser = await this.userService.findById(payload.id);
    if (!dbUser || dbUser.password.substring(0, 10) !== payload.hash) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
