import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { SignInUserResponse } from 'src/presentation/dtos/signInUserResponse.dto';
import { SignInTenantResponse } from 'src/presentation/dtos/signInTenantResponse.dto';
import { TenantsService } from './tenants.service';
import { userModel } from 'src/presentation/dtos/user.model';
import { tenantModel } from 'src/presentation/dtos/tenant.model';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private tenantsService: TenantsService,
        private jwtService: JwtService
    ) { }

    async signIn(
        email: string, password: string
    ): Promise<{ access_token: string, user: SignInUserResponse | SignInTenantResponse }> {

        let user: any = await this.usersService.findByEmail(email);
        let role = "user";

        if (!user) {
           user = await this.tenantsService.findByEmail(email);
           role = "tenant";
        }

        if (!user) throw new UnauthorizedException();

         const isPasswordMatch = await bcrypt.compare(password, user.password);

        if(!isPasswordMatch) throw new UnauthorizedException();

        const payload = { email: user.email, name: user.name, role: role };

        let signInResponse: SignInUserResponse | SignInTenantResponse;

        if (role === 'user') {
            signInResponse = {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                image: user.image,
                age: user.age,
                role: 'user'
            };
        } else if (role === 'tenant') {
            signInResponse = {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                image: user.image,
                role: 'tenant',
            };
        }

        return {
            access_token: await this.jwtService.signAsync(payload),
            user: signInResponse
        };
    }

    async signUpAsUser(userSignUpDto: userModel) {
         const salt = 10;
         const hashedPassword = await bcrypt.hash(userSignUpDto.password, salt);
         const unhashedPassword = userSignUpDto.password;
         userSignUpDto.password = hashedPassword;
         userSignUpDto.confirmPassword = hashedPassword;
        const user = await this.usersService.create(userSignUpDto);
        if(user) return this.signIn(userSignUpDto.email, unhashedPassword);
        else throw new BadRequestException();
    }

    async signUpAsTenant(tenantSignUpDto: tenantModel) {
        const salt = 10;
        const hashedPassword = await bcrypt.hash(tenantSignUpDto.password, salt);
        const unhashedPassword = tenantSignUpDto.password;
        tenantSignUpDto.password = hashedPassword;
        tenantSignUpDto.confirmPassword = hashedPassword;
        const tenant = await this.tenantsService.create(tenantSignUpDto);
        if(tenant) return this.signIn(tenantSignUpDto.email,  unhashedPassword);
        else throw new BadRequestException();
    }
}