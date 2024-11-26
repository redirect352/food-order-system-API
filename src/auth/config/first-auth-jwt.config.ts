import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
  'first-auth-jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_FIRST_AUTH_SECRET_KEY,
    signOptions: {
      expiresIn: process.env.JWT_FIRST_AUTH_EXPIRE,
    },
  }),
);
