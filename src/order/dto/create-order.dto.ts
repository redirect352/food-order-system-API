import { ArrayMinSize, IsInt, Min, Validate } from 'class-validator';
import { IsArrayWithSameLength } from 'lib/validators/array-same-length.validator';
import { isMenuPositionsExists } from 'src/menu-position/validators/menu-positions-exists';

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
}
