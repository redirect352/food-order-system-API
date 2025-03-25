import { $Enums, branch_office } from '@prisma/client';
import { BranchOfficeMainInfoDto } from './branch-office-main-info.dto';

export class BranchOfficeFullInfoDto {
  public id: number;
  public name: string;
  public address: string;
  public officeType: $Enums.branch_office_type;
  public isAvailable: boolean;
  public servingCanteen?: BranchOfficeMainInfoDto;
  public changed: Date;
  public created: Date;
  constructor(office: branch_office, servingCanteen?: branch_office) {
    this.id = office.id;
    this.name = office.name;
    this.address = office.address;
    this.isAvailable = office.isAvailable;
    this.officeType = office.officeType;
    if (servingCanteen)
      this.servingCanteen = new BranchOfficeMainInfoDto(servingCanteen);
    this.changed = office.changed;
    this.created = office.created;
  }
}
