import {
  MinLength,
  IsString,
  IsEmail,
  Validate,
  IsOptional,
} from 'class-validator';
import { ExcludeBothProps } from 'src/lib/validators';

export class SignInDto {
  @IsOptional()
  @MinLength(5)
  @IsString()
  login: string;

  @IsOptional()
  @IsEmail()
  @IsString()
  email?: string;

  @Validate(ExcludeBothProps, ['email', 'login'])
  @MinLength(8)
  @IsString()
  password: string;
}
