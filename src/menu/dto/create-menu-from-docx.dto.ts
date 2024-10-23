import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinDate,
} from 'class-validator';
import { isBranchOfficeExists } from 'src/branch-office/validators/branch-office-exists.validator';

export class CreateMenuFromDocxDto {
  @IsOptional()
  @IsDate()
  relevantFrom?: Date;

  @IsOptional()
  @IsDate()
  @MinDate(() => new Date(), {
    message: 'Дата окончания действия меню должна быть позже текущей',
  })
  expire?: Date;

  @IsOptional()
  @IsString()
  name?: string;

  @IsInt()
  @Min(1)
  @isBranchOfficeExists({ checkOnCanteen: true })
  providingCanteenId: number;

  @IsOptional()
  @Transform(({ value }) => value.split(',').map((item) => +item))
  @ArrayMinSize(0)
  @IsInt({ each: true })
  @Min(1, { each: true })
  servedOffices: number[];
}
