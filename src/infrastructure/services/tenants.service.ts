import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { tenantModel } from '../../presentation/dtos/tenant.model';
import { Tenant, TenantDocument } from '../../domain/entities/tenant.entity';
import { Project } from 'src/domain/entities/project.entity';

@Injectable()
export class TenantsService {
  constructor(@InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,@InjectModel(Project.name) private projectModel: Model<Project>) {}

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

  async authorizeClient(clientID: string, clientSECRET: string): Promise<string> {
    const tenant = await this.tenantModel.findOne({ 'projects.clientID': clientID, 'projects.clientSECRET': clientSECRET }).exec();
    if (!tenant) {
      throw new Error('Tenant not found for the given client credentials.');
    }
    const project = tenant.projects.find(proj => proj.clientID === clientID && proj.clientSECRET === clientSECRET);
    if (!project) {
      throw new Error('Project not found for the given client credentials.');
    }
    return project._id.toString();
  }
}
