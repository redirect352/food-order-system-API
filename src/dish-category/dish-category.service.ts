import { Injectable } from '@nestjs/common';
import { DishCategory } from './dish-category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DishCategoryService {
  constructor(
    @InjectRepository(DishCategory)
    private dishCategoryRepository: Repository<DishCategory>,
  ) {}
  async getById(id: number) {
    return await this.dishCategoryRepository.findOne({ where: { id } });
  }
}
