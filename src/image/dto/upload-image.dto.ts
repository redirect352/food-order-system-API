import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class UploadImageDto {
  @IsOptional()
  @IsString()
  @MinLength(4)
  name?: string;

  @IsOptional()
  @Transform(({ value }) => value.split(','))
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
