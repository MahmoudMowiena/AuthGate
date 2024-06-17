import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request,
    UseGuards
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { SignInRequest } from '../dtos/signInRequest.dto';
import { userModel } from '../dtos/user.model';
import { tenantModel } from '../dtos/tenant.model';
import { UsersService } from 'src/infrastructure/services/users.service';
import { User } from 'src/domain/entities/user.entity';
import { Types } from 'mongoose';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private usersService: UsersService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDto: SignInRequest) {
        return this.authService.signIn(signInDto.email, signInDto.password);
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @HttpCode(HttpStatus.OK)
    @Post('registeruser')
    signUpAsUser(@Body() userSignUpDto: userModel) {
        return this.authService.signUpAsUser(userSignUpDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('registertenant')
    signUpAsTenant(@Body() tenantSignUpDto: tenantModel) {
        return this.authService.signUpAsTenant(tenantSignUpDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('authcode')
    async exchangeCodeWithToken(@Body() obj: { projectId: string, userId: string, authCode: string }) {
        const { projectId, userId, authCode } = obj;
        const user: userModel = await this.usersService.findById(userId);
        if(!user) throw new BadRequestException("user does not exist");

        const userProject = user.projects.find(project => project.projectID.toString() === projectId);

        if(userProject.authorizationCode == authCode) {
            return {
                auth_token: userProject.authorizationAccessToken
            }
        }
    }
}