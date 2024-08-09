import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { isBranchOfficeExists } from 'src/branch-office/validators/branch-office-exists.validator';
import { IsDishCategoryExists } from 'src/dish-category/validators/dish-category-exists.validator';
import { isImageExists } from 'src/image/validators/image-exists.validator';

export class CreateDishDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(3)
  description: string;

  @IsString()
  @MinLength(1)
  quantity: string;

  @IsString()
  @MinLength(1)
  calorieContent: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  proteins?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  fats?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  carbohydrates?: number;

  @IsOptional()
  @IsString()
  bestBeforeDate?: string;

  @IsOptional()
  @IsString()
  externalProducer?: string;

  @IsInt()
  @Min(1)
  @isImageExists()
  imageId: number;

  @IsInt()
  @Min(1)
  @isBranchOfficeExists({ checkOnCanteen: true })
  providingCanteenId: number;

  @IsInt()
  @Min(1)
  @IsDishCategoryExists()
  dishCategoryId: number;
}
