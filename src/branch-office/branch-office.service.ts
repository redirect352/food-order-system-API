import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { GetBranchOfficeDto } from './dto/get-office.dto';
import { PrismaService } from '../database/prisma.service';
import { CreateBranchOfficeDto } from './dto/create-branch-office.dto';
import { UpdateBranchOfficeDto } from './dto/update-branch-office.dto';
import { $Enums, Prisma } from '@prisma/client';
import { GetBranchOfficeFullInfoListDto } from './dto/get-branch-office-full-info-list.dto';
import { ResponseWithPagination } from '../../types/response';
import { BranchOfficeFullInfoDto } from './dto/branch-office-full-info.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class BranchOfficeService {
  constructor(
    private prismaService: PrismaService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}
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
    const { officeId, ...updateValues } = updateBranchOfficeDto;
    if (updateValues.isAvailable === false) {
      await this.userService.invalidateUsersAuthStatus({
        employee: {
          officeId,
        },
      });
    }
    return this.prismaService.branch_office.update({
      where: { id: officeId },
      data: {
        ...updateValues,
      },
    });
  }

  async getBranchOfficeList(
    officeType?: $Enums.branch_office_type,
    where?: Prisma.branch_officeWhereInput,
    include?: { servingCanteen?: boolean },
  ) {
    return this.prismaService.branch_office.findMany({
      where: { officeType, ...where },
      include,
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

  async removeBranchOfficeById(id: string) {
    return this.prismaService.branch_office.delete({
      where: { id: +id },
    });
  }

  async getBranchOfficesFullInfoList({
    page,
    pageSize,
    sortOrder,
    orderBy,
  }: GetBranchOfficeFullInfoListDto): Promise<
    ResponseWithPagination<BranchOfficeFullInfoDto[]>
  > {
    const count = await this.prismaService.branch_office.count();
    const offices = await this.prismaService.branch_office.findMany({
      include: { servingCanteen: true },
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: !!orderBy
        ? {
            [orderBy]: sortOrder ?? 'asc',
          }
        : undefined,
    });
    return {
      data: offices.map(
        (office) => new BranchOfficeFullInfoDto(office, office.servingCanteen),
      ),
      page: page,
      totalPages: Math.ceil(count / pageSize),
    };
  }
}
