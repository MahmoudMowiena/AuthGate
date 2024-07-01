import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { SignInUserResponse } from 'src/presentation/dtos/signInUserResponse.model';
import { SignInTenantResponse } from 'src/presentation/dtos/signInTenantResponse.model';
import { TenantsService } from './tenants.service';
import { userModel } from 'src/presentation/dtos/user.model';
import { tenantModel } from 'src/presentation/dtos/tenant.model';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { UserProject } from 'src/domain/entities/userProject.entity';
import { projectModel } from 'src/presentation/dtos/project.model';
import { User } from 'src/domain/entities/user.entity';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tenantsService: TenantsService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{
    access_token: string;
    user: SignInUserResponse | SignInTenantResponse;
  }> {
    let user: any =
      (await this.usersService.findByEmail(email)) ||
      (await this.tenantsService.findByEmail(email));

    if (!user || user.deleted) {
      throw new UnauthorizedException('Account not found or has been deleted');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) throw new UnauthorizedException();

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const generalResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
      role: user.role,
    };

    let signInResponse: SignInUserResponse | SignInTenantResponse;

    if (user.role === 'user') {
      signInResponse = {
        ...generalResponse,
        age: user.age,
        projects: user.projects,
      };
    } else if (user.role === 'tenant') {
      signInResponse = {
        ...generalResponse,
        website: user.website,
        address: user.address,
      };
    } else if (user.role === 'admin') {
      signInResponse = {
        ...generalResponse,
        age: user.age,
      };
    }

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: signInResponse,
    };
  }

  async signUpAsUser(userSignUpDto: userModel) {
    const { email, password, confirmPassword } = userSignUpDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    let existingUser: any = await this.usersService.findByEmail(email);
    if (!existingUser) {
      existingUser = await this.tenantsService.findByEmail(email);
      if (existingUser) throw new BadRequestException('Email already in use');
    }

    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    const userToCreate = {
      ...userSignUpDto,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      role: 'user',
    };

    const user = await this.usersService.create(userToCreate);
    if (!user) {
      throw new BadRequestException('User could not be created');
    }

    return this.signIn(email, password);
  }

  async signUpAsTenant(tenantSignUpDto: tenantModel) {
    const { email, password, confirmPassword } = tenantSignUpDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingTenant = await this.tenantsService.findByEmail(email);
    if (existingTenant) {
      throw new ConflictException('Email already in use');
    }

    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    const tenantToCreate = {
      ...tenantSignUpDto,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      role: 'tenant',
    };

    const tenant = await this.tenantsService.create(tenantToCreate);
    if (!tenant) {
      throw new BadRequestException('Tenant could not be created');
    }

    return this.signIn(email, password);
  }

  async processAuth(
    projectId: any,
    userId: string,
    projectName: string,
    codeChallenge: string,
  ): Promise<any> {
    const user: userModel = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newPayload = {
      email: user.email,
      name: user.name,
      phone: user.phone,
      image: user.image,
      age: user.age,
    };

    const projectID = projectId;
    const authorizationCode = crypto.randomBytes(16).toString('hex');
    const authorizationAccessToken: string =
      await this.jwtService.signAsync(newPayload);
    const name = projectName;
    const expireDate: Date = new Date(Date.now() + 24 * 60 * 60 * 1000);

    let newUserProject: UserProject = {
      projectID,
      authorizationCode,
      authorizationAccessToken,
      name,
      expireDate,
      codeChallenge,
    };

    const existingUserProject: UserProject = user.projects?.find(
      (project) => project.projectID === projectID,
    );

    if (existingUserProject) {
      existingUserProject.authorizationAccessToken =
        newUserProject.authorizationAccessToken;
      existingUserProject.authorizationCode = newUserProject.authorizationCode;
      existingUserProject.expireDate = newUserProject.expireDate;
      existingUserProject.codeChallenge = codeChallenge;
    } else {
      user.projects.push(newUserProject);
    }

    await this.usersService.save(user);

    const targetTenant =
      await this.tenantsService.findTenantByProjectId(projectID);

    if (!targetTenant) {
      throw new ConflictException('Tenant not found for the given project ID');
    }

    const targetProject: projectModel | any = targetTenant.projects.find(
      (project) => project._id.toString() === projectID,
    );

    if (!targetProject) {
      throw new ConflictException('Project not found in tenant');
    }

    const callbackUrl: string = targetProject.callBackUrl;

    return {
      userId,
      projectID,
      callbackUrl,
      authorizationCode,
    };
  }

  async validateGitHubUser(profile: any): Promise<User> {
    const { id, username, displayName, photos } = profile;
    let user = await this.usersService.findByGitHubId(id);

    if (!user) {
      let userEmail = `${username}${Math.floor(Math.random() * 10000)}@authGate.com`;
      let notUnique = await this.usersService.findByEmail(userEmail);
      while (notUnique) {
        userEmail = `${username}${Math.floor(Math.random() * 10000)}@authGate.com`;
        notUnique = await this.usersService.findByEmail(userEmail);
      }
      const hashedPassword = await bcrypt.hash(uuidv4(), 10);

      user = await this.usersService.createGithubUser({
        name: displayName || username,
        githubId: id,
        image: photos && photos[0] && photos[0].value,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        role: 'user',
        email: userEmail,
        isFirstTime: true,
      });
    } else {
      user.isFirstTime = false;
    }

    return user;
  }

  async signInWithGitHub(
    user: User,
  ): Promise<{ access_token: string; user: any }> {
    const payload = {
      sub: user._id,
      email: user.email,
      name: user.name,
      role: 'user',
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        age: user.age,
        githubId: user.githubId,
        role: 'user',
        isFirstTime: user.isFirstTime,
      },
    };
  }

  async validateGoogleUser(profile: any): Promise<User> {
    const { id, displayName, emails, photos } = profile;
    const email = emails && emails[0] && emails[0].value;
    let user: any = await this.usersService.findByGoogleId(id);

    if (!user && email) {
      user = await this.usersService.findByEmail(email);
      if (user) {
        user.googleId = id;
        if (user.name === undefined || user.name === '' || user.name === null)
          user.name = displayName;
        if (
          user.image === undefined ||
          user.image === '' ||
          user.image === null
        )
          user.image = photos && photos[0] && photos[0].value;

        await this.usersService.save(user);
      } else {
        const hashedPassword = await bcrypt.hash(uuidv4(), 10);

        user = await this.usersService.create({
          email: email,
          name: displayName,
          googleId: id,
          image: photos && photos[0] && photos[0].value,
          password: hashedPassword,
          confirmPassword: hashedPassword,
          role: 'user',
        });
      }
    } else if (!user) {
      throw new UnauthorizedException('Unable to authenticate with Google');
    }
    console.log('before return');

    return user;
  }

  async signInWithGoogle(
    user: User,
  ): Promise<{ access_token: string; user: any }> {
    const payload = {
      sub: user._id,
      email: user.email,
      name: user.name,
      role: 'user',
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        age: user.age,
        googleId: user.googleId,
        role: 'user',
      },
    };
  }

  async validateFacebookUser(profile: any): Promise<User> {
    const { facebookId, email, firstName, lastName, picture } = profile;
    let user: any = await this.usersService.findByFacebookId(facebookId);
    if (!user && email) {
      user = await this.usersService.findByEmail(email);
      if (user) {
        user.facebookId = facebookId;
        if (user.name === undefined || user.name === '' || user.name === null)
          user.name = `${firstName} ${lastName}`;
        if (
          user.image === undefined ||
          user.image === '' ||
          user.image === null
        )
          user.image = picture;
        await this.usersService.save(user);
      } else {
        const hashedPassword = await bcrypt.hash(uuidv4(), 10);
        user = await this.usersService.create({
          email: profile.email,
          name: `${firstName} ${lastName}`,
          facebookId: facebookId,
          image: picture,
          password: hashedPassword,
          confirmPassword: hashedPassword,
          role: 'user',
        });
      }
    } else if (!user) {
      throw new UnauthorizedException('Unable to authenticate with Facebook');
    }
    return user;
  }

  async signInWithFacebook(user: User) {
    const payload = {
      sub: user._id,
      email: user.email,
      name: user.name,
      role: 'user',
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        age: user.age,
        role: 'user',
      },
    };
  }

  async sendResetPasswordResetEmail(email: string): Promise<void> {
    let user: any = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.tenantsService.findByEmail(email);
    }
    if (!user) {
      throw new NotFoundException(`User doesn't exist`);
    }

    const resetToken = this.jwtService.sign(
      { email },
      { secret: process.env.PASSWORD_RESET_JWT_SECRET, expiresIn: '1h' },
    );
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await this.usersService.save(user);
    const resetLink = `http://localhost:4200/reset-password/${resetToken}`;
    await this.emailService.sendMail(
      user.email,
      'Password Reset Request',
      `Click the following link to reset your password:\n ${resetLink}`,
    );
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmNewPassword: string,
  ): Promise<void> {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.PASSWORD_RESET_JWT_SECRET,
    });
    let user: any = await this.usersService.findByEmail(decoded.email);

    if (!user) {
      user = await this.tenantsService.findByEmail(decoded.email);
    }

    if (
      !user ||
      user.resetPasswordToken !== token ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired token');
    }

    if (newPassword === confirmNewPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.confirmPassword = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
    } else {
      throw new BadRequestException("Passwords don't match");
    }

    await this.usersService.save(user);
  }
}
