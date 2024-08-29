import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
} from '@nestjs/common';
import { BranchOfficeService } from './branch-office.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateBranchOfficeDto } from './dto/create-branch-office.dto';
import { UpdateBranchOfficeDto } from './dto/update-branch-office.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Roles('admin', 'client')
@Controller('branch-office')
export class BranchOfficeController {
  constructor(private readonly branchOfficeService: BranchOfficeService) {}
  @Post('/create')
  async createOffice(@Body() createBranchOfficeDto: CreateBranchOfficeDto) {
    const res = await this.branchOfficeService.createBranchOffice(
      createBranchOfficeDto,
    );
    if (res.identifiers.length > 0) {
      return res.identifiers[0];
    } else {
      throw new BadRequestException(
        'Невозможно создать филиал с указанными данными',
      );
    }
  }

  @Patch('/update')
  async updateOffice(@Body() updateOfficeDto: UpdateBranchOfficeDto) {
    const res =
      await this.branchOfficeService.updateBranchOffice(updateOfficeDto);
    if (res.affected > 0) {
      return { message: 'updated' };
    } else {
      throw new BadRequestException('Ошибка обновления данных филиала');
    }
  }

  @Public()
  @Get('/registration-list')
  async getRegistrationList() {
    return await this.branchOfficeService.getRegistrationList();
  }
}
