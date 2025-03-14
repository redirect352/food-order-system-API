// magiclogin.strategy.ts
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-magic-login';
import { EmailBuilderService } from 'src/lib/helpers/email-builder/email-builder.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ValidateEmailStrategy extends PassportStrategy(
  Strategy,
  'magic-login',
) {
  private readonly logger = new Logger(ValidateEmailStrategy.name);

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly mailService: MailerService,
    mailBuilderService: EmailBuilderService,
  ) {
    super({
      secret: configService.get<string>('VERIFY_SECRET'),
      jwtOptions: {
        expiresIn: configService.get<string>('VERIFY_EXPIRE'),
      },
      callbackUrl: `${configService.get<string>('BASE_URL')}/email-confirmation`,
      sendMagicLink: async (destination, href) => {
        await userService.updateUserByEmail(destination, {
          verificationEmailSendTime: new Date(),
        });
        this.mailService
          .sendMail({
            from: 'Система заказа питания <noreply.sales@minsktrans.by>',
            to: destination,
            subject: `Верификация в Системе заказа питания`,
            html: await mailBuilderService.fillConfirmationTemplate({
              ACCEPT_LINK: href,
            }),
          })
          .catch((err) =>
            this.logger.error(`Cannot send mail to ${destination}` + err),
          );
        // this.logger.debug(`sending email to ${destination} with Link ${href}`);
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
    return dbUser;
  }
}
