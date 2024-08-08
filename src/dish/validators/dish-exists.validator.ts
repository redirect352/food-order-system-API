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
import { DishService } from '../dish.service';

@ValidatorConstraint({ name: 'dish-exists', async: true })
@Injectable()
export class IsDishExistsConstraint implements ValidatorConstraintInterface {
  constructor(@Inject() private readonly dishService: DishService) {}

  async validate(dishId: number): Promise<boolean> {
    const dish = await this.dishService.getDishById(dishId);
    if (!dish) {
      throw new UnprocessableEntityException('Блюдо с таким id не существует');
    }
    return true;
  }
}

export function isDishExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsDishExistsConstraint,
    });
  };
}
