import { IsInt, Min } from 'class-validator';

export class GetUserMainInfoDto {
  @IsInt()
  @Min(1)
  id: number;
}
