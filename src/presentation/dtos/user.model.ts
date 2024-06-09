import { IsString, IsEmail, IsOptional, MinLength, IsNumber } from 'class-validator';

export class userModel {
  @IsString()
  name: string;

  @IsString()
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  // @IsOptional()
  // projects?: string[];
}
