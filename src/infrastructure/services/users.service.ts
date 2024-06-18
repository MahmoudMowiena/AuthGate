import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { userModel } from '../../presentation/dtos/user.model';
import { userProjectModel } from 'src/presentation/dtos/userProject.dto';
import { User, UserDocument } from '../../domain/entities/user.entity';
import { ImageService } from 'src/infrastructure/services/image.service';
import { updateUserModel } from 'src/presentation/dtos/updateUser.model';
import * as bcrypt from 'bcrypt';
import { ProjectService } from './project.service';
import { TenantsService } from './tenants.service';
import { projectModel } from 'src/presentation/dtos/project.model';
import { jwtConstants } from '../../constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private imageService: ImageService,
    private projectservice: ProjectService,
    private tenantservice: TenantsService,
  ) {}

  async create(createUserDto: userModel): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    const users = this.userModel.find().exec();
    for (const user of await users) {
      user.projects = await this.getUserProjects(user.projects);
    }

    return users;
  }

  async findId(id: string): Promise<userModel> {
    return await this.userModel.findById(id).exec();
  }

  async findById(id: string): Promise<userModel> {
    const user = this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    (await user).projects = await this.getUserProjects((await user).projects);
    return user;
  }

  async findByEmail(email: string): Promise<userModel> {
    return this.userModel.findOne({ email }).exec();
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

  async save(user: User | any): Promise<any> {
    return user.save();
  }

  async update(id: string, updateUserDto: userModel): Promise<User> {
    const email = updateUserDto.email;
    const name = (await this.findById(id)).name;
    if (this.findByEmail(email)) {
      throw new BadRequestException('email already exist, try to login');
    }
    if (name) {
      throw new BadRequestException('name already in use, try another name');
    }
    const userListAfterUpdate: any = this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    return userListAfterUpdate;
  }

  async updateWithPassword(
    id: string,
    updateUserDto: updateUserModel,
  ): Promise<any> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const email = updateUserDto.email;
    const name = (await this.findById(id)).name;
    if (this.findByEmail(email)) {
      throw new BadRequestException('email already exist, try to login');
    }
    if (name) {
      throw new BadRequestException('name already in use, try another name');
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
    return user.save();
  }

  async remove(id: string): Promise<any> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.deleted = true;
    return user.save();
  }

  async addImage(id: string, image: Express.Multer.File): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.imageService.upload('users', id, image);

    user.image =
      jwtConstants.imageUrl + 'users/' + `${id}/` + image.originalname;
    return user.save();
  }
}
