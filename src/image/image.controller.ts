import {
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
import { GetImageListDto } from './image.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Roles('admin')
@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpeg|png',
        })
        .addMaxSizeValidator({
          maxSize: 1000 * 1000 * 2,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.imageService.saveImageToStatic(file);
  }

  @Get('/list')
  get(
    @Query()
    getListDto: GetImageListDto,
  ) {
    return this.imageService.getList(getListDto.page, getListDto.pageSize);
  }
}
