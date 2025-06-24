import { employee } from '@prisma/client';

export class UserTagDto {
  public id: number;
  public userTag: string;

  constructor(id: number, employee: employee) {
    this.id = id;
    this.userTag = `${employee.surname} ${employee.name} ${employee.patronymic}, ${employee.personnelNumber}`;
  }
}
