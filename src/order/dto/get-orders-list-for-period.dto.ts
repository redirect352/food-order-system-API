import { IsDate } from 'class-validator';

export class GetOrdersListForPeriodDto {
  @IsDate()
  periodStart: Date;

  @IsDate()
  periodEnd: Date;
}
