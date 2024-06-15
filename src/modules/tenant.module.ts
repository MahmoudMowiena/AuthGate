import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from 'src/domain/entities/tenant.entity';
import { TenantsService } from 'src/infrastructure/services/tenants.service';
import { TenantController } from 'src/presentation/controllers/tenant.controller';
import { ProjectsModule } from './project.module';
import { ImageService } from 'src/infrastructure/services/image.service';
import { AuthModule } from './auth.module';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { UserModule } from './user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
    forwardRef(() => ProjectsModule),
    forwardRef(() => UserModule),
  ],
  controllers: [TenantController],
  providers: [TenantsService, ImageService, AuthService],
  exports: [TenantsService, MongooseModule, ImageService],
})
export class TenantModule {}
