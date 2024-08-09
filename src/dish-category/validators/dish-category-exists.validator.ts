import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DishCategoryService } from '../dish-category.service';

@ValidatorConstraint({ name: 'dish-category-exists', async: true })
@Injectable()
export class IsDishCategoryExistsConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    @Inject() private readonly dishCategoryService: DishCategoryService,
  ) {}

  async validate(dishId: number): Promise<boolean> {
    const category = await this.dishCategoryService.getById(dishId);
    if (!category) {
      throw new UnprocessableEntityException('Блюдо с таким id не существует');
    }
    return true;
  }
}

export function IsDishCategoryExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsDishCategoryExistsConstraint,
    });
  };
}
