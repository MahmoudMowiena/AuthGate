import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from 'src/domain/entities/tenant.entity';
import { TenantsService } from 'src/infrastructure/services/tenants.service';
import { TenantController } from 'src/presentation/controllers/tenant.controller';
import { ProjectsModule } from './project.module';

@Module({
  imports:[
        MongooseModule.forFeature([
            {name:Tenant.name, schema:TenantSchema}
    ]),
    forwardRef(() => ProjectsModule)
    ],
  controllers: [TenantController],
  providers: [TenantsService],
  exports: [TenantsService,MongooseModule],
})
export class TenantModule {}
