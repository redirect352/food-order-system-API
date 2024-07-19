import { IsString, MinLength } from 'class-validator';

export class SignInDto {
  @MinLength(5)
  @IsString()
  login: string;

  @MinLength(8)
  @IsString()
  password: string;
}
