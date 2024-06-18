import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { tenantModel } from '../../presentation/dtos/tenant.model';
import { Tenant, TenantDocument } from '../../domain/entities/tenant.entity';
import { ImageService } from './image.service';
import * as bcrypt from 'bcrypt';
import { updateTenantModel } from 'src/presentation/dtos/updateTenant.model';

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
    const email = updateTenantDto.email;
    const name = (await this.findById(id)).name;
    if (this.findByEmail(email)) {
      throw new BadRequestException('email already exist, try to login');
    }
    if (name) {
      throw new BadRequestException('name already in use, try another name');
    }
    const tenantListAfterUpdate: any = this.tenantModel
      .findOneAndUpdate({ _id: id, deleted: false }, updateTenantDto, {
        new: true,
      })
      .exec();
    return tenantListAfterUpdate;
  }

  async updateWithPassword(
    id: string,
    updateTenantDto: updateTenantModel,
  ): Promise<any> {
    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    const email = updateTenantDto.email;
    const name = (await this.findById(id)).name;
    if (this.findByEmail(email)) {
      throw new BadRequestException('email already exist, try to login');
    }
    if (name) {
      throw new BadRequestException('name already in use, try another name');
    }

    if (updateTenantDto.oldPassword) {
      const isMatch = await bcrypt.compare(
        updateTenantDto.oldPassword,
        tenant.password,
      );
      if (!isMatch) {
        throw new BadRequestException('Old password is incorrect');
      }
    }

    if (updateTenantDto.newPassword && updateTenantDto.confirmNewPassword) {
      if (updateTenantDto.newPassword !== updateTenantDto.confirmNewPassword) {
        throw new BadRequestException('New passwords do not match');
      }
      const salt = await bcrypt.genSalt();
      tenant.password = await bcrypt.hash(updateTenantDto.newPassword, salt);
      tenant.confirmPassword = tenant.password;
    }

    Object.assign(tenant, updateTenantDto);
    return tenant.save();
  }

  async remove(id: string): Promise<any> {
    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    tenant.deleted = true;
    return tenant.save();
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
