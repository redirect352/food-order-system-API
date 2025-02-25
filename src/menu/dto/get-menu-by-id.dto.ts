import { IsInt, Min } from 'class-validator';

export class GetMenuByIdDto {
  @IsInt()
  @Min(1)
  id: number;
}
