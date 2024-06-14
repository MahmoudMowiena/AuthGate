import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { SignInUserResponse } from 'src/presentation/dtos/signInUserResponse.dto';
import { SignInTenantResponse } from 'src/presentation/dtos/signInTenantResponse.dto';
import { TenantsService } from './tenants.service';
import { userModel } from 'src/presentation/dtos/user.model';
import { tenantModel } from 'src/presentation/dtos/tenant.model';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { UserProject } from 'src/domain/entities/userProject.entity';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tenantsService: TenantsService,
    private jwtService: JwtService,
  ) {}

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{
    access_token: string;
    user: SignInUserResponse | SignInTenantResponse;
  }> {
    let user: any = await this.usersService.findByEmail(email);
    let role = 'user';

    if (!user) {
      user = await this.tenantsService.findByEmail(email);
      role = 'tenant';
    }

    if (!user) throw new UnauthorizedException();

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) throw new UnauthorizedException();

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
        role: 'user',
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
      user: signInResponse,
    };
  }

  async signUpAsUser(userSignUpDto: userModel) {
    const salt = 10;
    const hashedPassword = await bcrypt.hash(userSignUpDto.password, salt);
    const email = userSignUpDto.email;
    const unhashedPassword = userSignUpDto.password;
    const unhashedConfirmPassword = userSignUpDto.confirmPassword;
    userSignUpDto.password = hashedPassword;
    userSignUpDto.confirmPassword = hashedPassword;

    if (unhashedPassword !== unhashedConfirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const user = await this.usersService.create(userSignUpDto);
    if (user) {
      return this.signIn(userSignUpDto.email, unhashedPassword);
    } else {
      throw new BadRequestException();
    }
  }

  async signUpAsTenant(tenantSignUpDto: tenantModel) {
    const salt = 10;
    const hashedPassword = await bcrypt.hash(tenantSignUpDto.password, salt);
    const email = tenantSignUpDto.email;
    const unhashedPassword = tenantSignUpDto.password;
    const unhashedConfirmPassword = tenantSignUpDto.confirmPassword;
    tenantSignUpDto.password = hashedPassword;
    tenantSignUpDto.confirmPassword = hashedPassword;
    if (unhashedPassword !== unhashedConfirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingTenant = await this.tenantsService.findByEmail(email);
    if (existingTenant) {
      throw new ConflictException('Email already in use');
    }

    const tenant = await this.tenantsService.create(tenantSignUpDto);
    if (tenant) return this.signIn(tenantSignUpDto.email, unhashedPassword);
    else throw new BadRequestException();
  }

  async processAuth(projectId: any, token: string): Promise<any> {
    let userproject: UserProject;
    let payload;
    console.log('hello from process Auth');
    try {
      console.log('hello from process Auth after try');
      payload = this.jwtService.verify(token);
      console.log(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    const userId = payload.sub;
    console.log(userId);
    const user = await this.usersService.findById(userId);
    console.log(user);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const projectID = projectId;
    const authorizationCode = uuidv4();
    const authorizationAccessToken = crypto.randomBytes(32).toString('hex');
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 24);

    if (projectID) {
      userproject = {
        projectID,
        authorizationCode,
        authorizationAccessToken,
        expireDate,
      };
      console.log(userproject);
    }

    user.projects.push(userproject);
    await this.usersService.save(user);
    console.log('hello after the last awiat');
    const callbackUrl = 'https:myhome:8070/home'; //after merge from dev call get projectbyId and assign

    return {
      userId,
      projectID,
      callbackUrl,
      authorizationCode,
    };
  }

  // async processAuth(projectId: any): Promise<any> {
  //   let userproject: UserProject;
  //   const token = '';
  //   let payload;
  //   try {
  //     payload = this.jwtService.verify(token);
  //   } catch (error) {
  //     throw new UnauthorizedException('Invalid token');
  //   }

  //   const userId = payload.sub;
  //   const user = await this.usersService.findById(userId);
  //   if (!user) {
  //     throw new UnauthorizedException('User not found');
  //   }

  //   const projectID = projectId;
  //   const authorizationCode = uuidv4();
  //   const authorizationAccessToken = crypto.randomBytes(32).toString('hex');
  //   const expireDate = new Date();
  //   expireDate.setHours(expireDate.getHours() + 24);

  //   if (projectID) {
  //     userproject = {
  //       projectID,
  //       authorizationCode,
  //       authorizationAccessToken,
  //       expireDate,
  //     };
  //   }

  //   user.projects.push(userproject);
  //   await this.usersService.save(user);

  //   const callbackUrl = ''; //after merge from dev call get projectbyId and assign

  //   return {
  //     callbackUrl,
  //     authorizationCode,
  //   };
  // }
}
