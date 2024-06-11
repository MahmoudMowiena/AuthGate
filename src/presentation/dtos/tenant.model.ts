import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, Matches, ValidateNested } from 'class-validator';
import { Project } from 'src/domain/entities/project.entity';

export class tenantModel {
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password too weak',
  })
  readonly password: string;

  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password too weak',
  })
  readonly confirmPassword: string;

  readonly phone?: string;
  readonly address?: string;
  readonly website?: string;
  readonly image?:string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Project)
  @IsOptional()
  projects?: Project[];
}
