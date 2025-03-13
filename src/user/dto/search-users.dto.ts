import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { isBranchOfficeExists } from '../../branch-office/validators/branch-office-exists.validator';

export class SearchUsersDto {
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
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsIn(['id', 'registered', 'changed'])
  orderBy?: 'id' | 'registered' | 'changed';
}
