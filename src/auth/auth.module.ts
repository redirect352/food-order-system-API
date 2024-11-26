import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptoModule } from '../lib/helpers/crypto/crypto.module';
import { LocalLoginStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { ValidateEmailStrategy } from './strategies/validate-email.strategy';
import { FirstAuthStrategy } from './strategies/first-auth.strategy';
import { JwtAuthGuard } from './guards/jwt.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailBuilderModule } from 'src/lib/helpers/email-builder/email-builder.module';
import { PasswordResetStrategy } from './strategies/password-reset.strategy';
import { TimeCheckerModule } from 'src/lib/helpers/time-checker/time-checker.module';
import { LocalEmailStrategy } from './strategies/local-email.strategy';
import { EmployeeModule } from 'src/employee/employee.module';
import jwtConfig from './config/jwt.config';
import mailerConfig from './config/mailer.config';
import refreshJwtConfig from './config/refresh-jwt.config';
import { RefreshJwtStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    MailerModule.forRootAsync(mailerConfig.asProvider()),
    CryptoModule,
    EmailBuilderModule,
    TimeCheckerModule,
    EmployeeModule,
    ConfigModule.forFeature(refreshJwtConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalLoginStrategy,
    LocalEmailStrategy,
    JwtStrategy,
    ValidateEmailStrategy,
    FirstAuthStrategy,
    PasswordResetStrategy,
    RefreshJwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: 'FirstAuthJwtService',
      useFactory: (configService: ConfigService) => {
        return new JwtService(configService.get('first-auth-jwt'));
      },
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
