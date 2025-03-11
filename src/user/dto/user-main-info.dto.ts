import { branch_office, user, employee } from '@prisma/client';
import { UserOwnInfoDto } from './user-own-info.dto';

export class UserMainInfoDto extends UserOwnInfoDto {
  public login: string;
  public role: string;
  public changed: Date;
  public registered: Date;
  public emailConfirmed: boolean;
  public activeEmployee: boolean;

  constructor(user: user, office: branch_office, employee: employee) {
    super({ id: user.id, email: user.email }, office, employee);
    this.login = user.login;
    this.role = user.role;
    this.changed = user.changed;
    this.registered = user.registered;
    this.emailConfirmed = !user.isPasswordTemporary;
    this.activeEmployee = employee.active;
  }
}
