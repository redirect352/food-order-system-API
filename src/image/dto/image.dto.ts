import { IsOptional, IsString, MinLength } from 'class-validator';

export class UploadImageDto {
  @IsOptional()
  @IsString()
  @MinLength(4)
  name?: string;
}
