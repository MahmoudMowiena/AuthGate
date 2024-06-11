import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { SignInUserResponse } from 'src/presentation/dtos/signInUserResponse.dto';
import { SignInTenantResponse } from 'src/presentation/dtos/signInTenantResponse.dto';
import { TenantsService } from './tenants.service';

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

        let user: any = await this.usersService.findOne(email);
        let role = "user";

        if (!user) {
            user = await this.tenantsService.findOne(email);
            role = "tenant";
        }

        if (user?.password !== password) {
            throw new UnauthorizedException();
        }

        const payload = { email: user.email, name: user.name, role: role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: user
        };
    }
}