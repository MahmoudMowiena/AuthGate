import { Exclude, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Project } from 'src/domain/entities/project.entity';

export class tenantModel {
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  readonly email: string;

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

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Project)
  @IsOptional()
  projects?: Project[];

  @IsString()
  role: string;

  @IsOptional()
  @IsBoolean()
  deleted?: boolean;
}
