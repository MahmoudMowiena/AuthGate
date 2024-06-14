import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

export class projectModel {
  @IsString()
  @IsOptional()
  tenantID: string;
  
  @IsString()
  @IsOptional()
  clientID?: string;

  @IsString()
  @IsOptional()
  clientSECRET?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  callBackUrl: string;
}