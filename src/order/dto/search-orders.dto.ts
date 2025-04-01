import { IsDate, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { isBranchOfficeExists } from '../../branch-office/validators/branch-office-exists.validator';
import { PaginationDto } from '../../lib/dto/pagination.dto';

export class SearchOrdersDto extends PaginationDto {
  @IsOptional()
  @IsDate()
  periodStart?: Date;

  @IsOptional()
  @IsDate()
  periodEnd?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  @isBranchOfficeExists()
  deliveryDestinationId?: number;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsIn(['id', 'changed', 'created'])
  orderBy?: 'id' | 'changed' | 'created';
}
