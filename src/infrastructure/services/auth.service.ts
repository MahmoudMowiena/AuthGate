import {
  BadRequestException,
  ConflictException,
  Injectable,
  Scope,
  ScopeOptions,
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
import { projectModel } from 'src/presentation/dtos/project.model';

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

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: role,
    };

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
        website: user.website,
        address: user.address,
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

    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    const userId = payload.sub;
    const user = await this.usersService.findById(userId);

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
    }

    const userProject = user.projects.find(
      (project) => project.projectID === projectID,
    );

    if (!userProject) {
      user.projects.push(userproject);
    }

    await this.usersService.save(user);

    const targetTenant =
      await this.tenantsService.findTenantByProjectId(projectId);

    if (!targetTenant) {
      throw new ConflictException('Tenant not found for the given project ID');
    }

    const targetProject: projectModel | any = targetTenant.projects.find(
      (project) => project._id.toString() === projectId,
    );

    if (!targetProject) {
      throw new ConflictException('Project not found in tenant');
    }

    const callbackUrl = targetProject.callBackUrl;

    return {
      userId,
      projectID,
      callbackUrl,
      authorizationCode,
    };
  }
}
