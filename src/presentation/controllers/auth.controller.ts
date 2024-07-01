import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from '../guards/auth.guard';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { SignInRequest } from '../dtos/signInRequest.model';
import { userModel } from '../dtos/user.model';
import { tenantModel } from '../dtos/tenant.model';
import { UsersService } from 'src/infrastructure/services/users.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { TenantsService } from 'src/infrastructure/services/tenants.service';
import * as CryptoJS from 'crypto-js';
import { SignInUserResponse } from '../dtos/signInUserResponse.model';
import { SignInTenantResponse } from '../dtos/signInTenantResponse.model';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private tenantsService: TenantsService,
  ) {}

  private readonly frontendUrl = 'http://localhost:4200';

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
    @Body() obj: { AuthCode: string; CodeVerifier: string },
  ) {
    const { AuthCode, CodeVerifier } = obj;

    const users = await this.usersService.findAll();

    const userWithProject = users.find((user) =>
      user.projects.some((project) => project.authorizationCode === AuthCode),
    );

    const targetUserProject = userWithProject?.projects.find(
      (project) => project.authorizationCode === AuthCode,
    );

    const hashedCodeVerifier = CryptoJS.SHA256(CodeVerifier).toString(
      CryptoJS.enc.Base64,
    );

    console.log('after');

    console.log(hashedCodeVerifier);
    console.log(targetUserProject.codeChallenge);

    if (hashedCodeVerifier !== targetUserProject.codeChallenge) {
      throw new UnauthorizedException();
    }

    return {
      auth_token: targetUserProject.authorizationAccessToken,
      userWithProject,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('token/user')
  async exchangeTokenForUserData(
    @Body() obj: { token: string },
  ): Promise<userModel> {
    const { token } = obj;

    const users = await this.usersService.findAll();

    const userWithProject = users.find((user) =>
      user.projects.some(
        (project) => project.authorizationAccessToken === token,
      ),
    );

    const targetUserProject = userWithProject?.projects.find(
      (project) => project.authorizationAccessToken === token,
    );

    if (!targetUserProject.expireDate && !targetUserProject.deleted) {
      return userWithProject;
    } else {
      throw new ConflictException('project may be deleted or token expired');
    }
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async loginWithGitHub() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req, @Res() res: Response) {
    const user1 = req.user;
    const { access_token, user } =
      await this.authService.signInWithGitHub(user1);

    const redirectUrl = `${this.frontendUrl}/auth/github/callback?token=${access_token}&user=${JSON.stringify(user)}`;

    return res.redirect(redirectUrl);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async loginWithGoogle() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const user1 = req.user;
    const { access_token, user } =
      await this.authService.signInWithGoogle(user1);

    const redirectUrl = `${this.frontendUrl}/auth/google/callback?token=${access_token}&user=${encodeURIComponent(JSON.stringify(user))}`;

    return res.redirect(redirectUrl);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async loginWithFacebook() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthCallback(@Req() req, @Res() res: Response) {
    const user1 = req.user;
    const { access_token, user } =
      await this.authService.signInWithFacebook(user1);

    const redirectUrl = `${this.frontendUrl}/auth/facebook/callback?token=${access_token}&user=${encodeURIComponent(JSON.stringify(user))}`;

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
