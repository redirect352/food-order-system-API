import { branch_office, employee } from '@prisma/client';
import { BranchOfficeMainInfoDto } from 'src/branch-office/dto/branch-office-main-info.dto';
import { EmployeeInfoDto } from '../../employee/dto/employee-info.dto';

export class UserOwnInfoDto {
  public id: number;
  public email: string;
  public office: BranchOfficeMainInfoDto;
  public employee: EmployeeInfoDto;
  constructor(
    user: { id: number; email: string },
    office: branch_office,
    employee: employee,
  ) {
    this.id = user.id;
    this.email = user.email;
    this.employee = new EmployeeInfoDto(employee);
    this.office = { id: office.id, name: office.name, address: office.address };
  }
}
