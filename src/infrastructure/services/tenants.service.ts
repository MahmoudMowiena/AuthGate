import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { tenantModel } from '../../presentation/dtos/tenant.model';
import { Tenant, TenantDocument } from '../../domain/entities/tenant.entity';
import { ImageService } from './image.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private imageService: ImageService,
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

  async update(id: string, updateTenantDto: tenantModel): Promise<any> {
    const tenantListAfterDelete: any = this.tenantModel
      .findOneAndUpdate({ _id: id, deleted: false }, updateTenantDto, {
        new: true,
      })
      .exec();
    return tenantListAfterDelete;
  }

  async remove(id: string): Promise<any> {
    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    tenant.deleted = true;
    tenant.save();
    return await this.findAll();
  }
  async authorizeClient(
    clientID: string,
    clientSECRET: string,
  ): Promise<string> {
    const tenant = await this.tenantModel
      .findOne({
        'projects.clientID': clientID,
        'projects.clientSECRET': clientSECRET,
      })
      .exec();
    if (!tenant) {
      throw new Error('Tenant not found for the given client credentials.');
    }
    const project = tenant.projects.find(
      (proj) =>
        proj.clientID === clientID && proj.clientSECRET === clientSECRET,
    );
    if (!project) {
      throw new Error('Project not found for the given client credentials.');
    }
    return project._id.toString();
  }

  async addImage(id: string, image: Express.Multer.File): Promise<Tenant> {
    const tenant = await this.tenantModel.findById(id).exec();

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    await this.imageService.upload('tenants', id, image);

    tenant.image = image.originalname;
    return tenant.save();
  }

  async findTenantByProjectId(projectId: string): Promise<any | null> {
    return this.tenantModel.findOne({ 'projects._id': projectId }).exec();
  }
}
