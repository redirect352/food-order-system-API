import {
  MinLength,
  IsString,
  IsEmail,
  IsStrongPassword,
  IsInt,
  Min,
  NotContains,
} from 'class-validator';
import { isBranchOfficeExists } from 'src/branch-office/validators/branch-office-exists.validator';

export class SignUpDto {
  @MinLength(5)
  @IsString()
  @NotContains('@')
  login: string;

  @IsEmail()
  @IsString()
  email: string;

  @IsStrongPassword()
  password: string;

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
