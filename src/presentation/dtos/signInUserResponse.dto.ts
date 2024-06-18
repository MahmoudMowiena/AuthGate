import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class SignInUserResponse {
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
  image?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsString()
  role: string;
}
