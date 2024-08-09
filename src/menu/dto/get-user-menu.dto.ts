import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetUserMenuDto {
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
  dishCategoryId?: number;

  @IsOptional()
  @IsIn(['ownProduct', 'alien'])
  productType?: 'ownProduct' | 'alien';
}
