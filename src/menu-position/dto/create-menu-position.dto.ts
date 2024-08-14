import {
  IsInt,
  IsOptional,
  Max,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator';
import { ExcludeBothProps } from 'lib/validators';
import { CreateDishDto } from 'src/dish/dto/create-dish.dto';
import { isDishExists } from 'src/dish/validators/dish-exists.validator';

export class CreateMenuPositionDto {
  @Validate(ExcludeBothProps, ['dishId', 'newDish'])
  @IsInt()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  @Max(100)
  discount: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @isDishExists()
  dishId: number;

  @IsOptional()
  @ValidateNested()
  newDish: CreateDishDto;
}
