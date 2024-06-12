import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { tenantModel } from '../../presentation/dtos/tenant.model';
import { Tenant, TenantDocument } from '../../domain/entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  async create(createTenantDto: tenantModel): Promise<Tenant> {
    const createdTenant = new this.tenantModel(createTenantDto);
    return createdTenant.save();
  }

  async findById(id: string): Promise<tenantModel> {
    return await this.tenantModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<tenantModel> {
    return this.tenantModel.findOne({ email }).exec();
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find().exec();
  }

  async update(id: string, updateTenantDto: tenantModel): Promise<Tenant> {
    return this.tenantModel
      .findOneAndUpdate({ _id: id, deleted: false }, updateTenantDto, {
        new: true,
      })
      .exec();
  }

  async remove(id: string): Promise<Tenant> {
    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    tenant.deleted = true;
    return tenant.save();
  }
}
