import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { isBranchOfficeExists } from '../validators/branch-office-exists.validator';

export class CreateBranchOfficeDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(3)
  address: string;

  @IsIn([0, 1])
  isCanteen: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @isBranchOfficeExists({ checkOnCanteen: true })
  servingCanteenId: number;
}
