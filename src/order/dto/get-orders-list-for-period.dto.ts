import { IsDate, IsInt, Min } from 'class-validator';
import { isBranchOfficeExists } from '../../branch-office/validators/branch-office-exists.validator';

export class GetOrdersListForPeriodDto {
  @IsDate()
  periodStart: Date;

  @IsDate()
  periodEnd: Date;

  @IsInt()
  @Min(1)
  @isBranchOfficeExists()
  deliveryDestinationId: number;
}
