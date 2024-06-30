import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { tenantModel } from '../../presentation/dtos/tenant.model';
import { Tenant, TenantDocument } from '../../domain/entities/tenant.entity';
import { ImageService } from './image.service';
import * as bcrypt from 'bcrypt';
import { updateTenantModel } from 'src/presentation/dtos/updateTenant.model';
import { jwtConstants } from '../../constants';

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
    return await this.tenantModel.findById(id);
  }

  async findByEmail(email: string): Promise<tenantModel> {
    return this.tenantModel.findOne({ email });
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find();
  }

  async update(id: string, updateTenantDto: tenantModel): Promise<tenantModel> {
    const { email, name } = updateTenantDto;
    let user: tenantModel;

    try {
      user = await this.findById(id);

      if (!user) {
        throw new NotFoundException('Tenant not found or already deleted');
      }

      if (email) {
        const existingTenant = await this.findByEmail(email);
        if (
          existingTenant &&
          existingTenant.email === email &&
          user.email !== email
        ) {
          throw new ConflictException('Email already exists, try to login');
        }
      }

      if (name) {
        const tenants = await this.findAll();
        const isNameInUse = tenants.some(
          (tenant) => tenant.name === name && user.name !== name,
        );
        if (isNameInUse) {
          throw new ConflictException('Name already in use, try another one');
        }
      }

      const tenantAfterUpdate = await this.tenantModel.findOneAndUpdate(
        { _id: id, deleted: false },
        updateTenantDto,
        { new: true },
      );

      if (!tenantAfterUpdate) {
        throw new NotFoundException('Tenant not found or already deleted');
      }

      return tenantAfterUpdate;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        console.error('Error updating tenant:', error);
        throw new InternalServerErrorException('Failed to update tenant');
      }
    }
  }

  async updateWithPassword(
    id: string,
    updateTenantDto: updateTenantModel,
  ): Promise<tenantModel> {
    const tenant = await this.tenantModel.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const { email, name, oldPassword, newPassword, confirmNewPassword } =
      updateTenantDto;

    try {
      if (email && email !== tenant.email) {
        const existingTenant = await this.findByEmail(email);
        if (existingTenant) {
          throw new ConflictException('Email already exists, try to login');
        }
      }

      if (name && name !== tenant.name) {
        const tenants = await this.findAll();
        if (tenants.some((t) => t.name === name)) {
          throw new ConflictException('Name already in use, try another one');
        }
      }

      if (oldPassword) {
        const isMatch = await bcrypt.compare(oldPassword, tenant.password);
        if (!isMatch) {
          throw new BadRequestException('Old password is incorrect');
        }
      }

      if (newPassword && confirmNewPassword) {
        if (newPassword !== confirmNewPassword) {
          throw new BadRequestException('New passwords do not match');
        }
        const salt = await bcrypt.genSalt();
        tenant.password = await bcrypt.hash(newPassword, salt);
        tenant.confirmPassword = tenant.password;
      }

      Object.assign(tenant, updateTenantDto);
      return await tenant.save();
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      } else {
        console.error('Error updating tenant with password:', error);
        throw new InternalServerErrorException('Failed to update tenant');
      }
    }
  }

  async remove(id: string): Promise<tenantModel> {
    const tenant = await this.tenantModel.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    tenant.deleted = true;
    await tenant.save({ validateModifiedOnly: true });
    return tenant;
  }

  async undelete(id: string): Promise<tenantModel> {
    const tenant = await this.tenantModel.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    tenant.deleted = false;
    await tenant.save({ validateModifiedOnly: true });
    return tenant;
  }

  async authorizeClient(
    clientID: string,
    clientSECRET: string,
  ): Promise<string> {
    const tenant = await this.tenantModel.findOne({
      'projects.clientID': clientID,
      'projects.clientSECRET': clientSECRET,
    });

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

  async addImage(id: string, imageBuffer: Buffer, imageName: string): Promise<Tenant> {
    const tenant = await this.tenantModel.findById(id);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    await this.imageService.upload('tenants', id, imageBuffer, imageName);

    tenant.image =
      jwtConstants.imageUrl + 'tenants/' + `${id}/` + imageName;

    return tenant.save();
  }

  async findTenantByProjectId(projectId: string): Promise<any | null> {
    return this.tenantModel.findOne({ 'projects._id': projectId });
  }
}
