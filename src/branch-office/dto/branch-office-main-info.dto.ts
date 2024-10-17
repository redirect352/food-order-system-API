import { branch_office } from '@prisma/client';

export class BranchOfficeMainInfoDto {
  public id: number;
  public name: string;
  public address: string;
  constructor(office: branch_office) {
    this.id = office.id;
    this.name = office.name;
    this.address = office.address;
  }
}
