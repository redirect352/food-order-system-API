import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { isBranchOfficeExists } from '../../branch-office/validators/branch-office-exists.validator';
import { Transform } from 'class-transformer';

export class SearchEmployeesDto {
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(20)
  pageSize?: number = 10;

  @IsOptional()
  @IsInt()
  @Min(1)
  @isBranchOfficeExists()
  destinationOfficeId?: number;

  @IsOptional()
  @IsString()
  s?: string;

  @IsOptional()
  @Transform(({ obj, key }) => {
    return obj[key] === 'true' ? true : obj[key] === 'false' ? false : obj[key];
  })
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsIn(['id', 'personnelNumber', 'surname'])
  orderBy?: 'id' | 'personnelNumber' | 'surname';
}
