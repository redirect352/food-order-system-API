import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptoModule } from './crypto/crypto.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { ValidateEmailStrategy } from './strategies/validate-email.strategy';
import { FirstAuthStrategy } from './strategies/first-auth.strategy';
import { JwtAuthGuard } from './guards/jwt.quard';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRE'),
        },
      }),
      inject: [ConfigService],
    }),
    CryptoModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    ValidateEmailStrategy,
    FirstAuthStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: 'FirstAuthJwtService',
      useFactory: (configService: ConfigService) => {
        return new JwtService({
          secret: configService.get<string>('JWT_FIRST_AUTH_SECRET_KEY'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_FIRST_AUTH_EXPIRE'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
