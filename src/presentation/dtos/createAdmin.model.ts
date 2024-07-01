import { IsString, IsEmail } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;

  @IsString()
  readonly confirmPassword: string;

  @IsString()
  readonly role: string;
}
