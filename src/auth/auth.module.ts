import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptoModule } from '../../helpers/crypto/crypto.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { ValidateEmailStrategy } from './strategies/validate-email.strategy';
import { FirstAuthStrategy } from './strategies/first-auth.strategy';
import { JwtAuthGuard } from './guards/jwt.quard';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailBuilderModule } from 'helpers/email-builder/email-builder.module';
import { PasswordResetStrategy } from './strategies/password-reset.strategy';
import { TimeCheckerModule } from 'helpers/time-checker/time-checker.module';

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
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          auth: {
            user: configService.get<string>('EMAIL_USERNAME'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
          secure: false,
          port: 25,
        },
      }),
      inject: [ConfigService],
    }),
    CryptoModule,
    EmailBuilderModule,
    TimeCheckerModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    ValidateEmailStrategy,
    FirstAuthStrategy,
    PasswordResetStrategy,
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
