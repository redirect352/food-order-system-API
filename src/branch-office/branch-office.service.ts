import { Injectable } from '@nestjs/common';
import { BranchOffice } from './branch-office.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BranchOfficeService {
  constructor(
    @InjectRepository(BranchOffice)
    private branchOfficeRepository: Repository<BranchOffice>,
  ) {}
  async getBranchOfficeById(id: number) {
    return this.branchOfficeRepository.findOne({
      where: { id },
      select: ['id', 'isCanteen', 'name', 'servingCanteen', 'address'],
    });
  }
}
