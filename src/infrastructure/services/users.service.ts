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
    console.log('hi from save');
    return user.save();
  }

  async update(id: string, updateUserDto: userModel): Promise<User> {
    const userListAfterUpdate: any = this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    return userListAfterUpdate;
  }

  async remove(id: string): Promise<any> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.deleted = true;
    user.save();
    return await this.findAll();
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
