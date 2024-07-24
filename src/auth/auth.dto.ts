import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class SignInDto {
  @MinLength(5)
  @IsString()
  login: string;

  @MinLength(8)
  @IsString()
  password: string;
}

export class UpdateUserDto {
  @MinLength(5)
  @IsString()
  newLogin: string;

  @MinLength(8)
  @IsString()
  newPassword: string;
}
export class ResetPasswordDto {
  @IsOptional()
  @IsEmail()
  @IsString()
  email?: string;

  @IsOptional()
  @MinLength(5)
  @IsString()
  login?: string;
}
export class ChangePasswordDto {
  @IsStrongPassword()
  newPassword: string;
}
