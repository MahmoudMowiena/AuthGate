import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class SignInTenantResponse {
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
}