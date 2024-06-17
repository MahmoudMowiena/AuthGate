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
} from 'class-validator';
import { UserProject } from 'src/domain/entities/userProject.entity';

export class updateUserModel {
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;

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
  image?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsArray()
  projects?: UserProject[];

  @IsOptional()
  @IsBoolean()
  deleted?: boolean;

  @IsString()
  @IsNotEmpty({ message: 'oldPassword is required' })
  oldPassword: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty({ message: 'newPassword is required' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'New Password must include a number, lowercase, uppercase, special character',
    },
  )
  newPassword: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty({ message: 'confirmNewPassword is required' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Confirm New Password must include a number, lowercase, uppercase, special character',
    },
  )
  confirmNewPassword: string;
}
