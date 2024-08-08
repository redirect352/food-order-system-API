import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BranchOfficeService } from '../branch-office.service';

@ValidatorConstraint({ name: 'branch-office-exists', async: true })
@Injectable()
export class IsBranchOfficeExistsConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    @Inject() private readonly branchOfficeService: BranchOfficeService,
  ) {}

  async validate(
    branchOfficeId: number,
    { constraints }: ValidationArguments,
  ): Promise<boolean> {
    const checkOnCanteen = constraints[0];
    const branchOffice =
      await this.branchOfficeService.getBranchOfficeById(branchOfficeId);
    if (!branchOffice) {
      throw new UnprocessableEntityException(
        'Филиала с указанным id не существует',
      );
    }
    if (!branchOffice.isCanteen && checkOnCanteen) {
      throw new UnprocessableEntityException(
        'Указанный филиал не является столовой.',
      );
    }
    return true;
  }
}
export type BranchOfficeExistsOptions = {
  checkOnCanteen: boolean;
};

export function isBranchOfficeExists(
  options: BranchOfficeExistsOptions = { checkOnCanteen: false },
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options.checkOnCanteen],
      validator: IsBranchOfficeExistsConstraint,
    });
  };
}
