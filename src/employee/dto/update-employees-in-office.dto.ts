import { IsInt, Min } from 'class-validator';
import { isBranchOfficeExists } from 'src/branch-office/validators/branch-office-exists.validator';

export class UpdateEmployeesInOfficeDto {
  @IsInt()
  @Min(1)
  @isBranchOfficeExists()
  officeId: number;
}
