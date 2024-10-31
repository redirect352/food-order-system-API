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
      await this.prismaService.$transaction(async (tx) => {
        await tx.$queryRawTyped(setOfficeEmployeesInactive(officeId));
        await tx.employee.createMany({
          data: content,
          skipDuplicates: true,
        });
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
        });
      });
    } catch (err) {
      this.logger.log(err);
      throw new NotAcceptableException('Cannot update user list.');
    }
  }
  async findEmployeeById(id: number) {
    return this.prismaService.employee.findUnique({ where: { id } });
  }

  async findEmployee(where: {
    officeId: number;
    surname: string;
    personnelNumber: string;
  }) {
    return this.prismaService.employee.findFirst({
      where,
    });
  }
}
