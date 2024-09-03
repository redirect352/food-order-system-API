import { IsDate, IsOptional, MaxDate } from 'class-validator';

export class GetTotalDto {
  @IsOptional()
  @IsDate()
  @MaxDate(() => new Date())
  periodStart?: Date;

  @IsOptional()
  @IsDate()
  @MaxDate(() => new Date())
  periodEnd?: Date = new Date();
}
