import { branch_office, employee } from '@prisma/client';
import { EmployeeInfoDto } from './employee-info.dto';
import { BranchOfficeMainInfoDto } from '../../branch-office/dto/branch-office-main-info.dto';

export class EmployeeFullInfoDto extends EmployeeInfoDto {
  office: BranchOfficeMainInfoDto;
  active: boolean;
  constructor(employee: employee, office: branch_office) {
    super(employee, { includeId: true });
    this.office = new BranchOfficeMainInfoDto(office);
    this.active = employee.active;
  }
}
