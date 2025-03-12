import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  NotContains,
} from 'class-validator';
import { isBranchOfficeExists } from '../../branch-office/validators/branch-office-exists.validator';
import { $Enums } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @MinLength(5)
  @IsString()
  @NotContains('@')
  login?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(Object.values($Enums.user_role))
  role?: string;

  @IsOptional()
  @IsBoolean()
  emailConfirmed?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @isBranchOfficeExists()
  officeId?: number;
}
