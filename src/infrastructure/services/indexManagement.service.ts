import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/domain/entities/user.entity';

@Injectable()
export class IndexManagementService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onModuleInit() {
    await this.ensureIndexes();
  }

  async ensureIndexes() {
    try {
      await this.userModel.collection.dropIndex('googleId_1');
    } catch (error) {
      if (error.code !== 27) {
        // 27 is the code for "index not found"
        throw error;
      }
    }

    try {
      await this.userModel.collection.dropIndex('githubId_1');
    } catch (error) {
      if (error.code !== 27) {
        // 27 is the code for "index not found"
        throw error;
      }
    }

    try {
      await this.userModel.collection.dropIndex('facebookId_1');
    } catch (error) {
      if (error.code !== 27) {
        // 27 is the code for "index not found"
        throw error;
      }
    }

    await this.userModel.collection.createIndex(
      { googleId: 1 },
      { unique: true, sparse: true },
    );
    await this.userModel.collection.createIndex(
      { githubId: 1 },
      { unique: true, sparse: true },
    );
    await this.userModel.collection.createIndex(
      { facebookId: 1 },
      { unique: true, sparse: true },
    );
  }
}
