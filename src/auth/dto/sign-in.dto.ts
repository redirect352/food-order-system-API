import {
  MinLength,
  IsString,
  IsEmail,
  Validate,
  IsOptional,
  NotContains,
} from 'class-validator';
import { ExcludeBothProps } from 'src/lib/validators';

export class SignInDto {
  @IsOptional()
  @MinLength(5)
  @IsString()
  @NotContains('@')
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
