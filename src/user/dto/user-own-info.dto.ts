import { branch_office, employee } from '@prisma/client';

export class UserOwnInfoDto {
  public id: number;
  public surname: string;
  public patronymic: string;
  public name: string;
  public personnelNumber: string;
  public email: string;
  public office: { id: number; name: string; address: string };
  constructor(
    user: { id: number; email: string },
    office: branch_office,
    employee: employee,
  ) {
    this.id = user.id;
    this.email = user.email;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { active, ...employeeSelectedFields } = employee;
    Object.assign(this, employeeSelectedFields);
    this.office = { id: office.id, name: office.name, address: office.address };
  }
}
