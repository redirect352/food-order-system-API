import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
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

@Roles('admin')
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('/update-list-in-office')
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
  @Roles('admin', 'menu_moderator')
  async searchUsers(@Query() searchUsersDto: SearchEmployeesDto) {
    console.log(searchUsersDto);
    return await this.employeeService.searchEmployees(searchUsersDto);
  }
}
