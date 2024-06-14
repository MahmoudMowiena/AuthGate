import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from 'src/domain/entities/tenant.entity';
import { TenantsService } from 'src/infrastructure/services/tenants.service';
import { TenantController } from 'src/presentation/controllers/tenant.controller';
import { ProjectsModule } from './project.module';
import { ImageService } from 'src/infrastructure/services/image.service';

@Module({
  imports:[
    MongooseModule.forFeature([
            {name:Tenant.name, schema:TenantSchema}
    ]),
    forwardRef(() => ProjectsModule)
    ],
  controllers: [TenantController],
  providers: [TenantsService, ImageService],
  exports: [TenantsService,MongooseModule,ImageService],
})
export class TenantModule {}
