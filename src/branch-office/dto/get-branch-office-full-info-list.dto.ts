import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetBranchOfficeFullInfoListDto {
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(30)
  pageSize?: number = 30;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsIn(['id', 'changed', 'created'])
  orderBy?: 'id' | 'changed' | 'created';
}
