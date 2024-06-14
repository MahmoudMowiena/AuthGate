import { Schema } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { User, userSchema } from '../domain/entities/user.entity';
import { UserController } from '../presentation/controllers/user.controller';
import { UsersService } from 'src/infrastructure/services/users.service';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { TenantsService } from 'src/infrastructure/services/tenants.service';
import { TenantModule } from './tenant.module';
import { ProjectsModule } from './project.module';

@Module({
  imports: [
    TenantModule,
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
   

  ],
  providers: [AuthService, UsersService],
  controllers: [UserController],
  exports: [UsersService,MongooseModule],
})
export class UserModule {}
