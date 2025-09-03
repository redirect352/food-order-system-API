import { branch_office, image_tag } from '@prisma/client';
import { BranchOfficeMainInfoDto } from '../../../branch-office/dto/branch-office-main-info.dto';

export class ImageTagDto {
  public id: number;
  public tagName: string;
  public canteen: BranchOfficeMainInfoDto;
  constructor(tag: image_tag, office?: branch_office) {
    this.id = tag.id;
    this.tagName = tag.tagName;
    if (office) this.canteen = new BranchOfficeMainInfoDto(office);
  }
}
