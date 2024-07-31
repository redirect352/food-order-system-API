import { IsOptional, IsEmail, IsString, MinLength } from 'class-validator';

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
