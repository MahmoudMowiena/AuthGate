import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class SignInTenantResponse {
  @IsString()
  _id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsString()
  role: string;
}
