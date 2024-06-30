import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { userModel } from '../../presentation/dtos/user.model';
import { User, UserDocument } from '../../domain/entities/user.entity';
import { ImageService } from 'src/infrastructure/services/image.service';
import { updateUserModel } from 'src/presentation/dtos/updateUser.model';
import * as bcrypt from 'bcrypt';
import { TenantsService } from './tenants.service';
import { jwtConstants } from '../../constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private imageService: ImageService,
    private tenantservice: TenantsService,
  ) {}

  async create(createUserDto: userModel): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async createGithubUser(createUserDto: userModel): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save({ validateBeforeSave: false });
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().populate('projects');
    return users;
  }

  async findById(id: string): Promise<userModel> {
    return await this.userModel.findById(id);
  }

  async findByIdWithProjects(id: string): Promise<userModel> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.projects = await this.getUserProjects(user.projects);

    return user;
  }

  async findByEmail(email: string): Promise<userModel> {
    return await this.userModel.findOne({ email });
  }

  private async getUserProjects(projectRef: any[]): Promise<any[]> {
    const targetProject = [];

    for (const projRef of projectRef) {
      const tenant = await this.tenantservice.findTenantByProjectId(
        projRef.projectID,
      );
      if (tenant) {
        const project = tenant.projects.find(
          (p) => p._id.toString() === projRef.projectID,
        );
        if (project) {
          targetProject.push(project);
        }
      }
    }
    return targetProject;
  }

  async findByGitHubId(githubId: string): Promise<User> {
    return this.userModel.findOne({ githubId }).exec();
  }

  async findByGoogleId(googleId: string): Promise<User> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findByFacebookId(facebookId: string): Promise<User> {
    return this.userModel.findOne({ facebookId }).exec();
  }

  async save(user: User | any): Promise<any> {
    return await user.save();
  }

  async update(id: string, updateUserDto: userModel): Promise<User> {
    let newEmail: any;
    let targetUser: userModel;
    let user: any;

    try {
      user = await this.findById(id);
      if (updateUserDto.email !== null) {
        newEmail = updateUserDto.email;
        targetUser = await this.findByEmail(newEmail);
      }

      if (
        targetUser &&
        targetUser.email === newEmail &&
        user.email != newEmail
      ) {
        throw new ConflictException('Email already exists, try to login');
      }

      const userAfterUpdate: any = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();

      if (!userAfterUpdate) {
        throw new NotFoundException('User not found');
      }

      return userAfterUpdate;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        console.error('Error updating user:', error);
        throw new InternalServerErrorException('Failed to update user');
      }
    }
  }

  async updateWithPassword(
    id: string,
    updateUserDto: updateUserModel,
  ): Promise<User> {
    let newEmail: any;
    let targetUser: userModel;
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      if (updateUserDto.email !== null) {
        newEmail = updateUserDto.email;
        targetUser = await this.findByEmail(newEmail);
      }

      if (targetUser && targetUser.email === newEmail) {
        throw new ConflictException('Email already exists, try to login');
      }

      if (updateUserDto.oldPassword) {
        const isMatch = await bcrypt.compare(
          updateUserDto.oldPassword,
          user.password,
        );
        if (!isMatch) {
          throw new BadRequestException('Old password is incorrect');
        }
      }

      if (updateUserDto.newPassword && updateUserDto.confirmNewPassword) {
        if (updateUserDto.newPassword !== updateUserDto.confirmNewPassword) {
          throw new BadRequestException('New passwords do not match');
        }
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(updateUserDto.newPassword, salt);
        user.confirmPassword = user.password;
      }

      Object.assign(user, updateUserDto);
      return await user.save();
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      } else {
        console.error('Error updating user with password:', error);
        throw new InternalServerErrorException('Failed to update user');
      }
    }
  }

  async remove(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.deleted = true;
    await user.save({ validateModifiedOnly: true });
    return user;
  }

  async delete(id: string, userID: string): Promise<User> {
    const user = await this.userModel.findById(userID);
    if (!user) {
      throw new NotFoundException(`Tenant not found`);
    }

    if (!user.projects || !Array.isArray(user.projects)) {
      throw new BadRequestException(
        'Projects list is not available for this tenant',
      );
    }

    const project = user.projects.find(
      (proj) => proj.projectID.toString() === id,
    );
    if (!project) {
      throw new NotFoundException(`Project with ID: ${id} not found in tenant`);
    }

    project.deleted = true;
    try {
      await user.save({ validateModifiedOnly: true });
      return user;
    } catch (error) {
      throw new BadRequestException('Failed to delete project');
    }
  }

  async undelete(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    user.deleted = false;
    await user.save({ validateModifiedOnly: true });
    return user;
  }

  async addImage(id: string, imageBuffer: Buffer, imageName: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.imageService.upload('users', id, imageBuffer, imageName);

    user.image =
      jwtConstants.imageUrl + 'users/' + `${id}/` + imageName;
    return user.save();
  }

  async findUserByProjectId(projectId: string): Promise<any | null> {
    return this.userModel.findOne({ 'projects._id': projectId });
  }
}
