import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { FindOptionsWhere, ObjectId, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CryptoService } from 'lib/helpers/crypto/crypto.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly cryptoService: CryptoService,
  ) {}

  async findUser(where: FindOptionsWhere<User> | FindOptionsWhere<User>[]) {
    return await this.usersRepository.findOneBy(where);
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
      .leftJoinAndSelect('user.office', 'userOffice')
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
}
