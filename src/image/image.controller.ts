import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetImageListDto } from './dto/get-image-list.dto';
import { UploadImageDto } from './dto/upload-image.dto';
import { ConfigService } from '@nestjs/config';

@Roles('admin', 'menu_moderator')
@Controller('image')
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly configService: ConfigService,
  ) {}
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadFileTest(
    @UploadedFiles(
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
    files: Array<Express.Multer.File>,
    @Body() uploadImageDto: UploadImageDto,
    @Req() req,
  ) {
    const result = await this.imageService.saveImages(
      files,
      uploadImageDto,
      req.user.userId,
    );
    return result;
  }

  @Get('/list')
  get(
    @Query()
    getListDto: GetImageListDto,
  ) {
    return this.imageService.getList(getListDto.page, getListDto.pageSize);
  }
}
