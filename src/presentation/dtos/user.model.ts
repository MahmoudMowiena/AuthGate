import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsNumber,
  IsNotEmpty,
  Matches,
  IsArray,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { UserProject } from 'src/domain/entities/userProject.entity';

export class userModel {
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty({ message: 'password is required' })
  @Matches(/^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/, {
    message:
      'Password must include a number, lowercase, uppercase, special character',
  })
  password: string;
  confirmPassword: string;

  @IsOptional()
  @IsString()
  resetPasswordToken?: string;

  @IsOptional()
  @IsDate()
  resetPasswordExpires?: Date;

  @Matches(/^\S+@\S+\.\S+$/, {
    message: 'email pattern is invalid',
  })
  @IsNotEmpty({ message: 'email is required' })
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  githubId?: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsArray()
  projects?: UserProject[];

  @IsString()
  role: string;

  @IsOptional()
  @IsBoolean()
  deleted?: boolean;
}
