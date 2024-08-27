import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { isBranchOfficeExists } from '../validators/branch-office-exists.validator';

export class UpdateBranchOfficeDto {
  @IsInt()
  @Min(1)
  @isBranchOfficeExists()
  officeId: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  address?: string;

  @IsOptional()
  @IsIn([0, 1])
  isCanteen?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @isBranchOfficeExists({ checkOnCanteen: true })
  servingCanteenId?: number;
}
