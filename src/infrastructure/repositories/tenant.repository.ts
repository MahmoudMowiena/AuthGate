import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { tenantModel } from '../../presentation/dtos/tenant.model';
import { Tenant, TenantDocument } from '../../domain/entities/tenant.entity';
import { ITenantRepository } from '../../domain/Irepositories/tenant.irepository';

@Injectable()
export class TenantRepository implements ITenantRepository{
  constructor(@InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>) {}

  async create(createTenantDto: tenantModel): Promise<Tenant> {
    const createdTenant = new this.tenantModel(createTenantDto);
    return createdTenant.save();
  }

  async findByEmail(email: string): Promise<Tenant | null> {
    return this.tenantModel.findOne({ email }).exec();
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find().exec();
  }
}
