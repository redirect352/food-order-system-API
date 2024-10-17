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
  async getRegistrationList() {
    return this.prismaService.branch_office.findMany({
      where: { isCanteen: false },
    });
  }

  async getBranchOffice(getBranchOfficeDto: GetBranchOfficeDto) {
    const { name } = getBranchOfficeDto;
    return this.prismaService.branch_office.findFirst({
      where: { name },
    });
  }
}
