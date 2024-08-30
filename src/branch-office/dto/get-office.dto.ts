import { IsString, MinLength } from 'class-validator';

export class GetBranchOfficeDto {
  @IsString()
  @MinLength(3)
  name: string;
}
