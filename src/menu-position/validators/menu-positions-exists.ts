import { Inject, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { MenuPositionService } from '../menu-position.service';

@ValidatorConstraint({ name: 'menu-positions-exists', async: true })
@Injectable()
export class IsMenuPositionsExistsConstraint
  implements ValidatorConstraintInterface
{
  private notExistIdList: number[] = [];
  constructor(
    @Inject() private readonly menuPositionService: MenuPositionService,
  ) {}

  async validate(idList: number[] | number): Promise<boolean> {
    if (typeof idList !== 'number' && (!idList || idList.length === 0)) {
      return false;
    }
    if (typeof idList === 'number') idList = [idList];
    const menuPositions =
      await this.menuPositionService.getMenuPositions(idList);
    if (!menuPositions || menuPositions.length !== idList.length) {
      this.notExistIdList = idList.filter(
        (item) =>
          menuPositions.findIndex((pos) => {
            return pos.id === item;
          }) === -1,
      );
      return false;
    }
    return true;
  }
  defaultMessage(validationArguments?: ValidationArguments) {
    if (!validationArguments.value) return 'Позиции меню не указаны';
    return `Не все позиции с указанными id(${this.notExistIdList}) существуют`;
  }
}

export function isMenuPositionsExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsMenuPositionsExistsConstraint,
    });
  };
}
