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
import { MenuPositionService } from '../menu-position.service';

@ValidatorConstraint({ name: 'menu-positions-exists', async: true })
@Injectable()
export class IsMenuPositionsExistsConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    @Inject() private readonly menuPositionService: MenuPositionService,
  ) {}

  async validate(idList: number[]): Promise<boolean> {
    const menuPositions = await this.menuPositionService.getMenuPositions(
      idList,
      ['id'],
    );
    if (!menuPositions || menuPositions.length !== idList.length) {
      throw new UnprocessableEntityException(
        `Позиции с id ${idList.filter(
          (item) =>
            menuPositions.findIndex((pos) => {
              return pos.id === item;
            }) === -1,
        )} не существуют`,
      );
    }
    return true;
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
