import {
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

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

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
}