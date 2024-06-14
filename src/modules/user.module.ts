import { Schema } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { User, userSchema } from '../domain/entities/user.entity';
import { UserController } from '../presentation/controllers/user.controller';
import { UsersService } from 'src/infrastructure/services/users.service';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { TenantsService } from 'src/infrastructure/services/tenants.service';
import { TenantModule } from './tenant.module';
import { ImageService } from 'src/infrastructure/services/image.service';

@Module({
  imports: [
    TenantModule,
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
  ],
  providers: [AuthService, UsersService, ImageService],
  controllers: [UserController],
  exports: [UsersService, ImageService],
})
export class UserModule {}