import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from 'src/domain/entities/tenant.entity';
import { TenantsService } from 'src/infrastructure/services/tenants.service';
import { TenantController } from 'src/presentation/controllers/tenant.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
  ],
  providers: [TenantsService],
  controllers: [TenantController],
  exports: [TenantsService],
})
export class TenantModule {}
