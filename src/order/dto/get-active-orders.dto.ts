import { IsInt, Max, Min } from 'class-validator';

export class GetActiveOrdersDto {
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(5)
  pageSize?: number = 3;
}
