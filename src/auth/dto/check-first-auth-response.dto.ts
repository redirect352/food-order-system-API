import { employee, user } from '@prisma/client';

export class CheckFirstAuthResponseDto {
  public name: {
    firstName: string;
    lastName: string;
    patronymic: string;
  };
  public login: string;

  constructor(user: user, employee: employee) {
    this.login = user.login;
    this.name = {
      firstName: employee.name,
      lastName: employee.surname,
      patronymic: employee.patronymic,
    };
  }
}
