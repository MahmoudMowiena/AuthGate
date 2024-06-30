import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserProject } from 'src/domain/entities/userProject.entity';

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

  @IsOptional()
  @IsArray()
  projects?: UserProject[];
}
