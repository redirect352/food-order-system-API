import { IsInt, IsString, Min, MinLength } from 'class-validator';
import { isBranchOfficeExists } from 'src/branch-office/validators/branch-office-exists.validator';

export class CheckEmployeeDto {
  @IsString()
  @MinLength(3)
  surname: string;

  @IsString()
  @MinLength(3)
  personnelNumber: string;

  @IsInt()
  @Min(1)
  @isBranchOfficeExists()
  officeId: number;
}
