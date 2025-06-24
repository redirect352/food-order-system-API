import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { isBranchOfficeExists } from 'src/branch-office/validators/branch-office-exists.validator';

export class CreateImageTagDto {
  @IsString({})
  @MinLength(4)
  tagName: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @isBranchOfficeExists({ checkOnCanteen: true })
  officeId?: number;
}
