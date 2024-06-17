import {
  BadRequestException,
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

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private imageService: ImageService,
  ) {}

  async create(createUserDto: userModel): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<userModel> {
    return this.userModel.findById(id).populate('projects').exec();
  }

  async findByEmail(email: string): Promise<userModel> {
    return this.userModel.findOne({ email }).populate('projects').exec();
  }

  async save(user: User | any): Promise<any> {
    return user.save();
  }

  async update(id: string, updateUserDto: userModel): Promise<User> {
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

    user.image = image.originalname;
    return user.save();
  }
}
