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
import { isMenuPositionsExists } from 'src/menu-position/validators/menu-positions-exists';

export class CreateMenuDto {
  @IsDate()
  relevantFrom: Date;

  @IsDate()
  @MinDate(() => new Date(), {
    message: 'Дата окончания действия меню должна быть позже текущей',
  })
  expire: Date;

  @IsOptional()
  @IsString()
  name?: string;

  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @isMenuPositionsExists()
  menuPositions: number[];

  @IsInt()
  @Min(1)
  @isBranchOfficeExists({ checkOnCanteen: true })
  providingCanteenId: number;

  @Transform(({ value }) => {
    return JSON.parse(value);
  })
  @ArrayMinSize(0)
  @IsInt({ each: true })
  @Min(1, { each: true })
  servedOffices: number[];
}
