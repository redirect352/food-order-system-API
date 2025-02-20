import { ArrayMinSize, IsInt, Min, Validate } from 'class-validator';
import { IsArrayWithSameLength } from 'src/lib/validators/array-same-length.validator';
import { isMenuPositionsExists } from 'src/menu-position/validators/menu-positions-exists';
import { isBranchOfficeExists } from '../../branch-office/validators/branch-office-exists.validator';

export class CreateOrderDto {
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @isMenuPositionsExists()
  menuPositions: number[];

  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Validate(IsArrayWithSameLength, ['menuPositions'])
  counts: number[];

  @IsInt()
  @Min(1)
  @isBranchOfficeExists()
  deliveryDestinationId: number;
}
