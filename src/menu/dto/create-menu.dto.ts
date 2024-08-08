import { ArrayMinSize, IsDate, IsInt, Min } from 'class-validator';
import { isBranchOfficeExists } from 'src/branch-office/validators/branch-office-exists.validator';
import { isMenuPositionsExists } from 'src/menu-position/validators/menu-positions-exists';

export class CreateMenuDto {
  @IsDate()
  relevantFrom: Date;
  @IsDate()
  expire: Date;

  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @isMenuPositionsExists()
  menuPositions: number[];

  @IsInt()
  @Min(1)
  @isBranchOfficeExists({ checkOnCanteen: true })
  providingCanteenId: number;
}
