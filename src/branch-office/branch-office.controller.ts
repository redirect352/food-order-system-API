import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BranchOfficeService } from './branch-office.service';
import { CreateBranchOfficeDto } from './dto/create-branch-office.dto';
import { UpdateBranchOfficeDto } from './dto/update-branch-office.dto';
import { GetBranchOfficeDto } from './dto/get-office.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { BranchOfficeMainInfoDto } from './dto/branch-office-main-info.dto';
import { GetBranchOfficeFullInfoListDto } from './dto/get-branch-office-full-info-list.dto';

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

  @Delete(`/delete/:id`)
  async deleteOffice(@Param('id') id: string) {
    try {
      await this.branchOfficeService.removeBranchOfficeById(id);
      return { message: 'deleted' };
    } catch (err) {
      throw new BadRequestException(
        'Ошибка невозможно удалить указанных филиал',
      );
    }
  }

  @Public()
  @Get('/registration-list')
  async getRegistrationList() {
    const offices = await this.branchOfficeService.getBranchOfficeList(
      'branch',
      { isAvailable: true },
    );
    return offices.map((office) => new BranchOfficeMainInfoDto(office));
  }

  @Get('/all')
  async getAllList() {
    const offices =
      await this.branchOfficeService.getBranchOfficeList(undefined);
    return offices.map((office) => new BranchOfficeMainInfoDto(office));
  }

  @Roles('menu_moderator', 'admin')
  @Get('/canteen-list')
  async getBranchOfficesList() {
    const offices = await this.branchOfficeService.getBranchOfficeList(
      'canteen',
      { isAvailable: true },
    );
    return offices.map((office) => new BranchOfficeMainInfoDto(office));
  }

  @Roles('client')
  @Get('/delivery-points')
  async getDeliveryPointsList() {
    const offices = await this.branchOfficeService.getBranchOfficeList(
      'branch',
      { isAvailable: true },
    );
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

  @Roles('admin')
  @Get('/all/full-info')
  async getOfficesFullInfoList(@Query() query: GetBranchOfficeFullInfoListDto) {
    return await this.branchOfficeService.getBranchOfficesFullInfoList(query);
  }
}
