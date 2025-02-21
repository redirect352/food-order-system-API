import { employee } from '@prisma/client';

export class EmployeeInfoDto {
  public id?: number;
  public surname: string;
  public personnelNumber: string;
  public name: string;
  public patronymic: string;
  constructor(employee: employee, options?: { includeId: boolean }) {
    this.name = employee.name;
    this.surname = employee.surname;
    this.personnelNumber = employee.personnelNumber;
    this.patronymic = employee.patronymic;
    if (options?.includeId) {
      this.id = employee.id;
    }
  }
}
