import { MailerOptions } from '@nestjs-modules/mailer';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'mailer',
  (): MailerOptions => ({
    transport: {
      host: process.env.EMAIL_HOST,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      secure: false,
      port: 25,
    },
  }),
);
