import { Injectable } from '@nestjs/common';
import { BranchOffice } from './branch-office.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBranchOfficeDto } from './dto/create-branch-office.dto';
import { UpdateBranchOfficeDto } from './dto/update-branch-office.dto';
import { GetBranchOfficeDto } from './dto/get-office.dto';

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
  async createBranchOffice(createBranchOfficeDto: CreateBranchOfficeDto) {
    const { name, servingCanteenId, isCanteen, address } =
      createBranchOfficeDto;
    return await this.branchOfficeRepository.insert({
      address,
      name,
      servingCanteen: { ...new BranchOffice(), id: servingCanteenId },
      isCanteen: Boolean(isCanteen),
    });
  }

  async updateBranchOffice(updateBranchOfficeDto: UpdateBranchOfficeDto) {
    const { officeId, name, servingCanteenId, isCanteen, address } =
      updateBranchOfficeDto;
    return await this.branchOfficeRepository.update(
      { id: officeId },
      {
        id: officeId,
        name,
        isCanteen: isCanteen !== undefined ? Boolean(isCanteen) : undefined,
        address,
        servingCanteen:
          servingCanteenId !== undefined
            ? { id: servingCanteenId, ...new BranchOffice() }
            : undefined,
      },
    );
  }
  async getRegistrationList() {
    return await this.branchOfficeRepository.find({
      where: { isCanteen: false },
    });
  }

  async getBranchOffice(getBranchOfficeDto: GetBranchOfficeDto) {
    const { name } = getBranchOfficeDto;
    return await this.branchOfficeRepository.findOne({
      where: { name },
    });
  }
}
