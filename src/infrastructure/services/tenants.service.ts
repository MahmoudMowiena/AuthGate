import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { tenantModel } from '../../presentation/dtos/tenant.model';
import { Tenant, TenantDocument } from '../../domain/entities/tenant.entity';
import { ITenantRepository } from '../../domain/Irepositories/tenant.irepository';

@Injectable()
export class TenantsService {
  constructor(@InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>) {}

  async create(createTenantDto: tenantModel): Promise<Tenant> {
    const createdTenant = new this.tenantModel(createTenantDto);
    return createdTenant.save();
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find().exec();
  }

  async findOne(id: string): Promise<Tenant> {
    return this.tenantModel.findById(id).exec();
  }

//   async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
//     return this.tenantModel.findByIdAndUpdate(id, updateTenantDto, { new: true }).exec();
//   }

//   async remove(id: string): Promise<Tenant> {
//     return this.tenantModel.findByIdAndRemove(id).exec();
//   }
}
