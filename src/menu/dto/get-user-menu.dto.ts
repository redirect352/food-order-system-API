import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { isBranchOfficeExists } from '../../branch-office/validators/branch-office-exists.validator';

export class GetUserMenuDto {
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(20)
  pageSize?: number = 10;

  @IsInt()
  @Min(1)
  @isBranchOfficeExists()
  destinationOfficeId: number;

  @IsOptional()
  @Transform((params) => params.value.split(',').map(Number))
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  dishCategoryId?: number[];

  @IsOptional()
  @Transform((params) => params.value.split(',').map((val) => val.trim()))
  @IsArray()
  @IsIn(['ownProduct', 'alien'], { each: true })
  productType?: 'ownProduct' | 'alien';
}
