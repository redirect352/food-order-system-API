import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { isBranchOfficeExists } from '../../branch-office/validators/branch-office-exists.validator';

export class EditImageTagsDto {
  @ValidateNested()
  @Type(() => EditableImageTagDto)
  tags: EditableImageTagDto[];
}
export class EditableImageTagDto {
  @IsString()
  id: string;
  @IsString({})
  @MinLength(4)
  tagName: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @isBranchOfficeExists({ checkOnCanteen: true })
  canteenId?: number;

  @IsIn(['old', 'new'])
  type: 'old' | 'new';

  @IsIn(['create', 'edit', 'delete'])
  action: 'create' | 'edit' | 'delete';
}
