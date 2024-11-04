import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchImageTagDto {
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10;

  @IsOptional()
  @IsString()
  searchString?: string;
}
