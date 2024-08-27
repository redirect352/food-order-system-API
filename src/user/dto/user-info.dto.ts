import { User } from '../user.entity';

export class UserInfoDto {
  public id: number;
  public surname: string;
  public patronymic: string;
  public name: string;
  public personnelNumber: string;
  public email: string;
  public office: { id: number; name: string; address: string };
  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    Object.assign(this, user.employeeBasicData);
  }
}
