import { Min } from 'class-validator';

export class DeleteImagesDto {
  @Min(1, { each: true })
  ids: number[];
}
