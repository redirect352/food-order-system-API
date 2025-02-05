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
      ignoreTLS: !!process.env.EMAIL_SECURE_STATE,
      secure: !!process.env.EMAIL_SECURE_STATE,
      port: +process.env.EMAIL_PORT,
    },
  }),
);
