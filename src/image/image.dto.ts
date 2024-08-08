import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class GetImageListDto {
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 5;
}
export class UploadImageDto {
  @IsOptional()
  @IsString()
  @MinLength(4)
  name?: string;
}
