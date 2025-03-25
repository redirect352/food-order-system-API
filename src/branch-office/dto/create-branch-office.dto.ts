import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { isBranchOfficeExists } from '../validators/branch-office-exists.validator';
import { $Enums } from '@prisma/client';

export class CreateBranchOfficeDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(3)
  address: string;

  @IsOptional()
  @IsIn(Object.values($Enums.branch_office_type))
  officeType?: $Enums.branch_office_type;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @isBranchOfficeExists({ checkOnCanteen: true })
  servingCanteenId: number;
}
