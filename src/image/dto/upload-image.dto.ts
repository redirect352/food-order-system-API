import { IsOptional, IsString, MinLength } from 'class-validator';
import { CreateImageTagDto } from '../image-tag/dto/create-image-tag.dto';
import { Transform } from 'class-transformer';

export class UploadImageDto {
  @IsOptional()
  @IsString()
  @MinLength(4)
  name?: string;

  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  tags: CreateImageTagDto[];
}
