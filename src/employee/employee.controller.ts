import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateEmployeesInOfficeDto } from './dto/update-employees-in-office.dto';
import { SearchEmployeesDto } from './dto/search-employees.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Roles('admin')
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('/update/list-in-office')
  @UseInterceptors(FileInterceptor('file'))
  async updateEmployeeList(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'text/plain',
        })
        .addMaxSizeValidator({
          maxSize: 1000 * 1000 * 10,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body() updateEmployeesInOfficeDto: UpdateEmployeesInOfficeDto,
  ) {
    return await this.employeeService.updateEmployeesInOffice(
      file,
      updateEmployeesInOfficeDto,
    );
  }

  @Get('/search')
  @Roles('admin')
  async searchEmployees(@Query() searchUsersDto: SearchEmployeesDto) {
    return await this.employeeService.searchEmployees(searchUsersDto);
  }

  @Post('/create')
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return await this.employeeService.createEmployee(createEmployeeDto);
  }

  @Patch('/update/:id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return await this.employeeService.updateEmployee(+id, updateEmployeeDto);
  }

  @Delete('/delete/:id')
  async deleteEmployee(@Param('id') id: string) {
    try {
      await this.employeeService.deleteEmployee(+id);
      return { message: 'deleted' };
    } catch (err) {
      throw new BadRequestException(
        'Ошибка невозможно удалить данного сотрудника',
      );
    }
  }
}
