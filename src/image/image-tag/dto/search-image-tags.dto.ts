import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { isBranchOfficeExists } from 'src/branch-office/validators/branch-office-exists.validator';

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

  @IsOptional()
  @IsInt()
  @Min(1)
  @isBranchOfficeExists({ checkOnCanteen: true })
  canteenId?: number;
}
