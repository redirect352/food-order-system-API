import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../lib/dto/pagination.dto';

export class SearchUserTagDto extends PaginationDto {
  @IsOptional()
  @IsString()
  s?: string = '';
}
