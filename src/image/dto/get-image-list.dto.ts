import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { isBranchOfficeExists } from '../../branch-office/validators/branch-office-exists.validator';

export class GetImageListDto {
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 5;

  @IsOptional()
  @IsString()
  s?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @isBranchOfficeExists({ checkOnCanteen: true })
  canteenId?: number;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsIn(['id', 'uploaded'])
  orderBy?: 'id' | 'uploaded';
}
