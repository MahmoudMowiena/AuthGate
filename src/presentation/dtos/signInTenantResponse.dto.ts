import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class SignInTenantResponse {
    
    @IsString()
    id: string;
    
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

    @IsString()
    role: 'tenant';
}