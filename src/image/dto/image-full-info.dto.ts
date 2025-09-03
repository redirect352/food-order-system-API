import {
  branch_office,
  employee,
  image,
  image_tag,
  user,
} from '@prisma/client';
import { UserOwnInfoDto } from '../../user/dto/user-own-info.dto';
import { ImageTagDto } from '../image-tag/dto/image-tag.dto';

export class ImageFullInfoDto {
  public id: number;
  public name: string;
  public path: string;
  public uploaded: Date;
  public author: UserOwnInfoDto;
  public tags: ImageTagDto[];
  constructor(
    image: image,
    author: user,
    authorOffice: branch_office,
    authorEmployee: employee,
    tags: image_tag[],
  ) {
    this.id = image.id;
    this.name = image.name;
    this.path = image.path;
    this.uploaded = image.uploaded;
    this.author = new UserOwnInfoDto(author, authorOffice, authorEmployee);
    this.tags = tags.map(
      (tag) => new ImageTagDto(tag, (tag as any)?.branch_office),
    );
  }
}
