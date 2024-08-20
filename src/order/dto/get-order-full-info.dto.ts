import { IsInt, Min, IsString, MinLength, IsDateString } from 'class-validator';

export class GetOrderFullInfoDto {
  @IsString()
  @MinLength(10)
  @IsDateString()
  date: string;

  @IsInt()
  @Min(1)
  number: number;
}
