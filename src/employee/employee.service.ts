import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CheckEmployeeDto } from 'src/auth/dto/check-employee.dto';
import { Employee } from './employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UpdateEmployeesInOfficeDto } from './dto/update-employees-in-office.dto';
import { User } from 'src/user/user.entity';
import { BranchOffice } from 'src/branch-office/branch-office.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private dataSource: DataSource,
  ) {}

  private readonly logger = new Logger(EmployeeService.name);

  async checkEmployeeCanRegister(checkEmployeeDto: CheckEmployeeDto) {
    const { officeId, surname, personnelNumber } = checkEmployeeDto;
    const employee = await this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.user', 'user')
      .where('employee.officeId=:officeId', { officeId })
      .andWhere('employee.active=true')
      .andWhere('employee.surname=:surname', { surname })
      .andWhere('employee.personnelNumber=:personnelNumber', {
        personnelNumber,
      })
      .getOne();
    if (!employee) {
      throw new ForbiddenException(
        'Сотрудника с указанной фамилией и табельным номером не существует',
      );
    }
    if (employee.user !== null) {
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
    const office = new BranchOffice();
    office.id = officeId;
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
        office,
        active: true,
        personnelNumber: item[1].toString(),
      }));

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const employeeRepository = queryRunner.manager.getRepository(Employee);
      const userQb = await queryRunner.manager
        .getRepository(User)
        .createQueryBuilder('user');
      await employeeRepository
        .createQueryBuilder('employee')
        .update()
        .set({ active: false })
        .where('employee.officeId = :officeId')
        .andWhere(
          'employee.id not IN (Select * from (' +
            userQb
              .select()
              .innerJoin('user.employeeBasicData', 'employee')
              .select(['employee.id as id'])
              .where('employee.officeId = :officeId')
              .andWhere('user.role != "client"')
              .getQuery() +
            ') as e1)',
        )
        .setParameter('officeId', officeId)
        .execute();
      return await employeeRepository
        .createQueryBuilder('employee')
        .insert()
        .values(content)
        .orUpdate(
          ['active', 'name', 'patronymic'],
          ['officeId', 'surname', 'personnelNumber'],
        )
        .execute();
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await queryRunner.release();
    }
  }
}
