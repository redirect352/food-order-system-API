import {
  ArrayMinSize,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { isMenuPositionsExists } from 'src/menu-position/validators/menu-positions-exists';

export class CreateOrderPositionDto {
  @ArrayMinSize(1)
  @IsInt()
  @Min(1)
  @isMenuPositionsExists()
  id: number;

  @IsInt()
  @Min(1)
  count: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
