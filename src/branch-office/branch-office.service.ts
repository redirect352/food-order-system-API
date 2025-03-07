import { Injectable } from '@nestjs/common';
import { GetBranchOfficeDto } from './dto/get-office.dto';
import { PrismaService } from '../database/prisma.service';
import { CreateBranchOfficeDto } from './dto/create-branch-office.dto';
import { UpdateBranchOfficeDto } from './dto/update-branch-office.dto';

@Injectable()
export class BranchOfficeService {
  constructor(private prismaService: PrismaService) {}
  async getBranchOfficeById(id: number) {
    return this.prismaService.branch_office.findUnique({
      where: { id },
    });
  }
  async createBranchOffice(createBranchOfficeDto: CreateBranchOfficeDto) {
    return this.prismaService.branch_office.create({
      data: {
        ...createBranchOfficeDto,
      },
    });
  }

  async updateBranchOffice(updateBranchOfficeDto: UpdateBranchOfficeDto) {
    const { officeId, name, servingCanteenId, isCanteen, address } =
      updateBranchOfficeDto;
    return this.prismaService.branch_office.update({
      where: { id: officeId },
      data: {
        name,
        address,
        servingCanteenId,
        isCanteen: isCanteen !== undefined ? Boolean(isCanteen) : undefined,
      },
    });
  }

  async getBranchOfficeList(isCanteen: boolean) {
    return this.prismaService.branch_office.findMany({
      where: { isCanteen },
    });
  }

  async getBranchOffice(getBranchOfficeDto: GetBranchOfficeDto) {
    const { name } = getBranchOfficeDto;
    return this.prismaService.branch_office.findFirst({
      where: { name },
    });
  }

  async getBranchOfficesIdsByNames(names: string[]) {
    const offices = await this.prismaService.branch_office.findMany({
      where: {
        name: {
          in: names,
        },
      },
    });
    return offices.map(({ id }) => id);
  }
}
