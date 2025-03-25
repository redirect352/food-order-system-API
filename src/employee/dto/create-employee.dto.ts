import { IsBoolean, IsInt, IsString, Min } from 'class-validator';
import { isBranchOfficeExists } from 'src/branch-office/validators/branch-office-exists.validator';

export class CreateEmployeeDto {
  @IsString()
  name: string;

  @IsString()
  surname: string;

  @IsString()
  patronymic: string;

  @IsString()
  personnelNumber: string;

  @IsBoolean()
  active: boolean;

  @IsInt()
  @Min(1)
  @isBranchOfficeExists({ checkOnCanteen: false })
  officeId: number;
}
