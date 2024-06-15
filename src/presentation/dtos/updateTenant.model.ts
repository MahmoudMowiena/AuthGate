import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Project } from 'src/domain/entities/project.entity';

export class updateTenantModel {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: 'Password too weak',
    },
  )
  newPassword: string;

  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: 'Password too weak',
    },
  )
  confirmNewPassword: string;

  @IsOptional()
  @IsString()
  image?: string;

  //@IsOptional()
  @IsString()
  password: string;

  //@IsOptional()
  @IsString()
  confirmPassword: string;

  @IsString()
  oldPassword?: string;

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

  @IsOptional()
  @IsBoolean()
  deleted?: boolean;
}
