import {
  ForbiddenException,
  Injectable,
  Logger,
  NotAcceptableException,
} from '@nestjs/common';
import { CheckEmployeeDto } from 'src/auth/dto/check-employee.dto';
import { UpdateEmployeesInOfficeDto } from './dto/update-employees-in-office.dto';
import { PrismaService } from '../database/prisma.service';
import { setOfficeEmployeesInactive } from '@prisma/client/sql';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { SearchEmployeesDto } from './dto/search-employees.dto';
import { Prisma } from '@prisma/client';
import { ResponseWithPagination } from '../../types/response';
import { EmployeeFullInfoDto } from './dto/employee-full-info.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private prismaService: PrismaService) {}
  private readonly logger = new Logger(EmployeeService.name);

  async checkEmployeeCanRegister(checkEmployeeDto: CheckEmployeeDto) {
    const { officeId, surname, personnelNumber } = checkEmployeeDto;
    const employeePrisma = await this.prismaService.employee.findFirst({
      where: {
        surname: {
          equals: surname,
          mode: 'insensitive',
        },
        personnelNumber,
        officeId,
        active: true,
      },
      select: {
        user: true,
      },
    });
    if (!employeePrisma) {
      throw new ForbiddenException(
        'Сотрудника с указанной фамилией и табельным номером не существует',
      );
    }
    if (employeePrisma.user !== null) {
      throw new ForbiddenException(
        'Сотрудник с указанной фамилией и табельным уже зарегистрирован в системе. Для восстановления доступа к аккаунту воспользуйтесь функцией восстановления пароля',
      );
    }
    return { message: 'Ok' };
  }

  async updateEmployeesInOffice(
    file: Express.Multer.File,
    updateEmployeesInOfficeDto: UpdateEmployeesInOfficeDto,
  ) {
    const { officeId } = updateEmployeesInOfficeDto;
    const content = file.buffer
      .toString()
      .split('\r\n')
      .map((item) => item.split('\t'))
      .map((item) => {
        if (item.length !== 2 || !+item[1]) return undefined;
        return [item[0].split(' '), item[1]];
      })
      .filter((item) => item)
      .map((item) => ({
        surname: item[0][0],
        name: item[0][1],
        patronymic: item[0][2],
        officeId,
        active: true,
        personnelNumber: item[1].toString(),
      }));
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const result = {
          created: 0,
          active: 0,
          inactive: 0,
        };
        const k = await tx.$queryRawTyped(setOfficeEmployeesInactive(officeId));
        result.inactive = Number(k[0]?.count);
        result.created = (
          await tx.employee.createMany({
            data: content,
            skipDuplicates: true,
          })
        ).count;
        result.active = (
          await tx.employee.updateMany({
            data: { active: true },
            where: {
              AND: [
                { officeId },
                {
                  personnelNumber: {
                    in: content.map((item) => item.personnelNumber),
                  },
                },
              ],
            },
          })
        ).count;
        result.inactive -= result.active;
        return result;
      });
    } catch (err) {
      this.logger.log(err);
      throw new NotAcceptableException('Cannot update user list.');
    }
  }
  async findEmployeeById(id: number, include?: Prisma.employeeInclude) {
    return this.prismaService.employee.findUnique({ where: { id }, include });
  }

  async findEmployee(where: {
    officeId: number;
    surname: string;
    personnelNumber: string;
  }) {
    return this.prismaService.employee.findFirst({
      where: {
        ...where,
        surname: {
          equals: where.surname,
          mode: 'insensitive',
        },
      },
    });
  }

  async updateEmployee(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    return await this.prismaService.employee.update({
      where: { id },
      data: {
        ...updateEmployeeDto,
      },
    });
  }

  async searchEmployees(
    searchUsersDto: SearchEmployeesDto,
  ): Promise<ResponseWithPagination<EmployeeFullInfoDto[]>> {
    const {
      page,
      pageSize,
      destinationOfficeId,
      s,
      orderBy,
      sortOrder,
      active,
    } = searchUsersDto;
    const where: Prisma.employeeWhereInput = {
      AND: [
        { officeId: destinationOfficeId, active },
        {
          OR: [
            { surname: { startsWith: s, mode: 'insensitive' } },
            { name: { startsWith: s, mode: 'insensitive' } },
            { patronymic: { startsWith: s, mode: 'insensitive' } },
            { personnelNumber: { startsWith: s, mode: 'insensitive' } },
          ],
        },
      ],
    };
    const count = await this.prismaService.employee.count({ where });
    const data = await this.prismaService.employee.findMany({
      include: { branch_office: true },
      omit: { officeId: true },
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: !!orderBy
        ? {
            [orderBy]: sortOrder ?? 'asc',
          }
        : undefined,
    });
    return {
      page,
      totalPages: Math.ceil(count / pageSize),
      data: data.map(
        (item) => new EmployeeFullInfoDto(item as any, item.branch_office),
      ),
    };
  }

  async createEmployee(createEmployeeDto: CreateEmployeeDto) {
    const res = await this.prismaService.employee.create({
      data: {
        ...createEmployeeDto,
      },
    });
    return res.id;
  }

  async deleteEmployee(id: number) {
    return await this.prismaService.employee.delete({
      where: { id },
    });
  }
}
