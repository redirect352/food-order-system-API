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
import { ImageService } from '../image.service';

@ValidatorConstraint({ name: 'image-exists', async: true })
@Injectable()
export class IsImageExistsConstraint implements ValidatorConstraintInterface {
  constructor(@Inject() private readonly imageService: ImageService) {}

  async validate(imageId: number): Promise<boolean> {
    const image = await this.imageService.getImageById(imageId);
    if (!image) {
      throw new UnprocessableEntityException(
        'Картинки с указанным id не существует',
      );
    }

    return true;
  }
}

export function isImageExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsImageExistsConstraint,
    });
  };
}
