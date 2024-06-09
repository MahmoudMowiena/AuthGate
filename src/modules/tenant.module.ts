import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from 'src/domain/entities/tenant.entity';
import { TenantRepository } from 'src/infrastructure/repositories/tenant.repository';
import { TenantController } from 'src/presentation/controllers/tenant.controller';

@Module({
  imports:[
        MongooseModule.forFeature([
            {name:Tenant.name,schema:TenantSchema}
    ])
    ],
  controllers: [TenantController],
  providers: [TenantRepository],
})
export class TenantModule {}
