import { IsInt, Min, Max } from 'class-validator';
import { isBranchOfficeExists } from '../../branch-office/validators/branch-office-exists.validator';

export class GetMenuListDto {
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
}
