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
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetImageListDto } from './dto/get-image-list.dto';
import { UploadImageDto } from './dto/upload-image.dto';

@Roles('admin', 'client')
@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpeg|png|jpg',
        })
        .addMaxSizeValidator({
          maxSize: 1000 * 1000 * 2,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto,
  ) {
    return this.imageService.saveImageToStatic(file, uploadImageDto);
  }

  @Get('/list')
  get(
    @Query()
    getListDto: GetImageListDto,
  ) {
    return this.imageService.getList(getListDto.page, getListDto.pageSize);
  }
}
