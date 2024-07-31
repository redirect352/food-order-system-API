import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'DoesNotHaveBoth' })
@Injectable()
export class ExcludeBothProps implements ValidatorConstraintInterface {
  async validate(value: string, args: ValidationArguments) {
    const { object, constraints } = args;
    return (
      constraints.length === 2 &&
      !(!object[constraints[0]] && !object[constraints[1]]) &&
      !(object[constraints[0]] && object[constraints[1]])
    );
  }

  defaultMessage() {
    return 'Ошибка! Запрос должен содержать либо $constraint1 либо  $constraint2';
  }
}
