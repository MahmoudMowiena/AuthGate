import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from '../guards/auth.guard';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { SignInRequest } from '../dtos/signInRequest.dto';
import { userModel } from '../dtos/user.model';
import { tenantModel } from '../dtos/tenant.model';
import { UsersService } from 'src/infrastructure/services/users.service';
import { User } from 'src/domain/entities/user.entity';
import { Types } from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInRequest) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @UseGuards(AuthenticationGuard)
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
  async exchangeCodeWithToken(
    @Body() obj: { projectId: string; userId: string; authCode: string },
  ) {
    const { projectId, userId, authCode } = obj;
    const user: userModel = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('user does not exist');

    const userProject = user.projects.find(
      (project) => project.projectID.toString() === projectId,
    );

    if (userProject.authorizationCode == authCode) {
      return {
        auth_token: userProject.authorizationAccessToken,
      };
    }
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async loginWithGitHub() {
    //
  }
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req) {
    const user = req.user;
    return this.authService.signInWithGitHub(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async loginWithGoogle() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req) {
    const user = req.user;
    return this.authService.signInWithGoogle(user);
  }
}
