import { IsInt, Min, ValidateNested } from 'class-validator';
import { isBranchOfficeExists } from '../../branch-office/validators/branch-office-exists.validator';
import { CreateOrderPositionDto } from './create-order-position.dto';

export class CreateOrderDto {
  @ValidateNested()
  menuPositions: CreateOrderPositionDto[];

  @IsInt()
  @Min(1)
  @isBranchOfficeExists()
  deliveryDestinationId: number;
}
