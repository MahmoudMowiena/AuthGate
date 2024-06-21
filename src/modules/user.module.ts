import { Schema } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Module, forwardRef } from '@nestjs/common';
import { User, userSchema } from '../domain/entities/user.entity';
import { UserController } from '../presentation/controllers/user.controller';
import { UsersService } from 'src/infrastructure/services/users.service';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { TenantsService } from 'src/infrastructure/services/tenants.service';
import { TenantModule } from './tenant.module';
import { ImageService } from 'src/infrastructure/services/image.service';
import { ProjectsModule } from './project.module';
import { IndexManagementService } from 'src/infrastructure/services/indexManagement.service';
import { EmailService } from 'src/infrastructure/services/email.service';

@Module({
  imports: [
    TenantModule,
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
    forwardRef(() => ProjectsModule),
  ],
  providers: [
    AuthService,
    UsersService,
    ImageService,
    IndexManagementService,
    EmailService,
  ],
  controllers: [UserController],
  exports: [UsersService, ImageService],
})
export class UserModule {}
