import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { isBranchOfficeExists } from 'src/branch-office/validators/branch-office-exists.validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @isBranchOfficeExists()
  officeId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  surname?: string;

  @IsOptional()
  @IsString()
  patronymic?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
