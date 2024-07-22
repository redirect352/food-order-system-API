import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByLogin(login: string) {
    return await this.usersRepository.findOneBy({ login });
  }
  async findById(id: number) {
    return await this.usersRepository.findOneBy({ id });
  }
  async updateUser(id: number, updatedUser: QueryDeepPartialEntity<User>) {
    console.log(id);
    return await this.usersRepository.update({ id: id }, updatedUser);
  }
}
