import { MinLength, IsString, IsStrongPassword } from 'class-validator';

export class UpdateCredentialsDto {
  @MinLength(5)
  @IsString()
  newLogin: string;

  @IsStrongPassword()
  newPassword: string;
}
