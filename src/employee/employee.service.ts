import { ForbiddenException, Injectable } from '@nestjs/common';
import { CheckEmployeeDto } from 'src/auth/dto/check-employee.dto';
import { Employee } from './employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}
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
        'Сотрудника с указанной фамилией и табельным уже зарегистрирован в системе. Для восстановления доступа к аккаунту воспользуйтесь функцией восстановления пароля',
      );
    }
    return { message: 'Ok' };
  }
}
