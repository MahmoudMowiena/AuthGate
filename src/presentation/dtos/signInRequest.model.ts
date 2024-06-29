import { IsEmail, IsString } from "class-validator";

export class SignInRequest {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}