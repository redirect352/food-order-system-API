import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'ArraySameLength' })
@Injectable()
export class IsArrayWithSameLength implements ValidatorConstraintInterface {
  async validate(value: Array<any>, args: ValidationArguments) {
    const { object, constraints } = args;
    return value?.length === object[constraints[0]]?.length;
  }

  defaultMessage() {
    return 'Количество элементов $property должно быть равно количеству элементов $constraint1';
  }
}
