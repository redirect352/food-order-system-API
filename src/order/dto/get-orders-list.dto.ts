import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetOrdersListDto {
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(5)
  pageSize?: number = 3;

  @IsOptional()
  @IsIn([0, 1])
  active?: number;
}
