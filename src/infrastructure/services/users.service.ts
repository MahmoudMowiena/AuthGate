import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { userModel } from '../../presentation/dtos/user.model';
//import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from '../../domain/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: userModel): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

//   async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
//     return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
//   }

//   async remove(id: string): Promise<User> {
//     return this.userModel.findByIdAndRemove(id).exec();
//   }
}
