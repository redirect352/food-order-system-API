import { IsDate, IsOptional } from 'class-validator';

export class UpdateMenuDto {
  @IsOptional()
  @IsDate()
  relevantFrom?: Date;

  @IsOptional()
  @IsDate()
  expire?: Date;
}
