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
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from '../guards/auth.guard';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { SignInRequest } from '../dtos/signInRequest.dto';
import { userModel } from '../dtos/user.model';
import { tenantModel } from '../dtos/tenant.model';
import { UsersService } from 'src/infrastructure/services/users.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TenantsService } from 'src/infrastructure/services/tenants.service';
import { UserProject } from 'src/domain/entities/userProject.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private tenantsService: TenantsService
  ) { }

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
    @Body() obj: { authCode: string },
  ) {
    const { authCode } = obj;

    //console.log(authCode)

    const users = await this.usersService.findAllWithUserProjects();

    const userWithProject = users.find(user =>
      user.projects.some(project => project.authorizationCode === authCode)
    );

    //console.log(userWithProject)

    const targetUserProject = userWithProject?.projects.find(project =>
      project.authorizationCode === authCode
    );

    return {
      auth_token: targetUserProject.authorizationAccessToken,
    }
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async loginWithGitHub() {
    //
  }
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req, @Res() res: Response) {
    const user1 = req.user;
    const { access_token, user } =
      await this.authService.signInWithGoogle(user1);

    // Redirect to the Angular frontend with tokens in query parameters
    const redirectUrl = `http://localhost:4200/auth/github/callback?token=${access_token}&user=${JSON.stringify(user)}`;

    return res.redirect(redirectUrl);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async loginWithGoogle() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const user1 = req.user;
    const { access_token, user } =
      await this.authService.signInWithGoogle(user1);

    // Redirect to the Angular frontend with tokens in query parameters
    const redirectUrl = `http://localhost:4200/auth/google/callback?token=${access_token}&user=${JSON.stringify(user)}`;

    return res.redirect(redirectUrl);
  }

  @Post('reset-password/request')
  async sendPasswordResetEmail(@Body('email') email: string): Promise<void> {
    await this.authService.sendResetPasswordResetEmail(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
    @Body('confirmNewPassword') confirmNewPassword: string,
  ): Promise<void> {
    await this.authService.resetPassword(
      token,
      newPassword,
      confirmNewPassword,
    );
  }

  @Post('istenant')
  async isTenant(
    @Body('clientId') clientId: string,
    @Body('clientSecret') clientSecret: string,
  ) {
    this.tenantsService.authorizeClient(clientId, clientSecret);
  }
}
