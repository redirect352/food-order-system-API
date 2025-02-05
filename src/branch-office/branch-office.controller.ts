import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BranchOfficeService } from './branch-office.service';
import { CreateBranchOfficeDto } from './dto/create-branch-office.dto';
import { UpdateBranchOfficeDto } from './dto/update-branch-office.dto';
import { GetBranchOfficeDto } from './dto/get-office.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { BranchOfficeMainInfoDto } from './dto/branch-office-main-info.dto';

@Roles('admin')
@Controller('branch-office')
export class BranchOfficeController {
  constructor(private readonly branchOfficeService: BranchOfficeService) {}
  @Post('/create')
  async createOffice(@Body() createBranchOfficeDto: CreateBranchOfficeDto) {
    const res = await this.branchOfficeService.createBranchOffice(
      createBranchOfficeDto,
    );
    if (res) {
      return res.id;
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
    if (res) {
      return { message: 'updated' };
    } else {
      throw new BadRequestException('Ошибка обновления данных филиала');
    }
  }

  @Public()
  @Get('/registration-list')
  async getRegistrationList() {
    const offices = await this.branchOfficeService.getBranchOfficeList(false);
    return offices.map((office) => new BranchOfficeMainInfoDto(office));
  }

  @Roles('menu_moderator', 'admin')
  @Get('/canteen-list')
  async getBranchOfficesList() {
    const offices = await this.branchOfficeService.getBranchOfficeList(true);
    return offices.map((office) => new BranchOfficeMainInfoDto(office));
  }

  @Roles('client')
  @Get('/delivery-points')
  async getDeliveryPointsList() {
    const offices = await this.branchOfficeService.getBranchOfficeList(false);
    return offices.map((office) => new BranchOfficeMainInfoDto(office));
  }

  @Get('/get-by-name/:name')
  async getBranchOffice(@Param() getBranchOfficeDto: GetBranchOfficeDto) {
    const office =
      await this.branchOfficeService.getBranchOffice(getBranchOfficeDto);
    if (!office)
      throw new NotFoundException(
        `Филиал с названием ${getBranchOfficeDto.name} не найден`,
      );
    return new BranchOfficeMainInfoDto(office);
  }
}
