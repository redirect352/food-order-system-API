import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DataSource, FindOptionsWhere, ObjectId, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CryptoService } from 'lib/helpers/crypto/crypto.service';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { Employee } from 'src/employee/employee.entity';
import { BranchOffice } from 'src/branch-office/branch-office.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly cryptoService: CryptoService,
    private dataSource: DataSource,
  ) {}
  private readonly logger = new Logger(UserService.name);

  async findUser(where: FindOptionsWhere<User> | FindOptionsWhere<User>[]) {
    return await this.usersRepository.findOne({
      where,
      relations: { employeeBasicData: { office: true } },
    });
  }

  async findByLogin(login: string) {
    return await this.usersRepository.findOneBy({ login });
  }
  async findById(id: number) {
    return await this.usersRepository.findOneBy({ id });
  }
  async findUserServingCanteen(id: number): Promise<number> {
    const res = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.employeeBasicData', 'employee')
      .leftJoinAndSelect('employee.office', 'userOffice')
      .select(['userOffice.servingCanteenId'])
      .where('user.id=:userId', { userId: id })
      .execute();
    const canteenId = res[0]?.servingCanteenId;
    if (!canteenId) throw new NotFoundException();
    return canteenId as number;
  }

  async updateUserById(id: number, updatedUser: QueryDeepPartialEntity<User>) {
    return await this.usersRepository.update({ id: id }, updatedUser);
  }
  async updateUser(
    criteria:
      | string
      | number
      | FindOptionsWhere<User>
      | Date
      | ObjectId
      | string[]
      | number[]
      | Date[]
      | ObjectId[],
    updatedUser: QueryDeepPartialEntity<User>,
  ) {
    return await this.usersRepository.update(criteria, updatedUser);
  }
  async updateUserPassword(
    criteria:
      | string
      | number
      | FindOptionsWhere<User>
      | Date
      | ObjectId
      | string[]
      | number[]
      | Date[]
      | ObjectId[],
    newPassword: string,
  ) {
    return await this.usersRepository.update(criteria, {
      password: await this.cryptoService.hashPassword(newPassword),
    });
  }

  async register(signUpDto: SignUpDto) {
    const { surname, email, login, password, personnelNumber, officeId } =
      signUpDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const employee = await queryRunner.manager
        .getRepository(Employee)
        .findOne({
          where: {
            surname,
            personnelNumber,
            office: { ...new BranchOffice(), id: officeId },
            user: null,
            active: true,
          },
        });
      if (!employee) {
        throw new ForbiddenException(
          'Невозможно создать аккаунт. Указанный сотрудник не существует либо уже зарегистрирован',
        );
      }
      const customer = new User();
      customer.email = email;
      customer.login = login;
      customer.role = 'client';
      customer.password = password;
      customer.isPasswordTemporary = true;
      customer.employeeBasicData = employee;
      const user = await queryRunner.manager.getRepository(User).save(customer);
      await queryRunner.commitTransaction();
      return user;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err?.status) throw err;
      if (err?.errno === 1062) {
        throw new ForbiddenException(
          'Невозможно создать аккаунт. Указанный логин или email уже занят',
        );
      }
      console.log(err);
      this.logger.error(err);
      throw new BadRequestException(err.message);
    } finally {
      await queryRunner.release();
    }
  }
}
