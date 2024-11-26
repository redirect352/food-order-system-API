import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { EmployeeService } from '../../employee/employee.service';
import { employee } from '@prisma/client';
import refreshJwtConfig from '../config/refresh-jwt.config';
import { Request } from 'express';
import * as argon2 from 'argon2';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private readonly userService: UserService,
    private readonly employeeService: EmployeeService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: refreshJwtConfiguration.secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const tokenFromHeader = req.headers.authorization
      .replace('Bearer', '')
      .trim();
    const user = await this.userService.findById(payload.id);
    let employee: employee = null;
    if (user)
      employee = await this.employeeService.findEmployeeById(user.employeeId);
    if (!user || !employee.active || user.role !== payload.role) return null;
    if (
      !user.refreshTokenHash ||
      !(await argon2.verify(user.refreshTokenHash, tokenFromHeader))
    )
      return null;
    return user;
  }
}
