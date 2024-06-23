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
  ) { }

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
    let newEmail: any;
    let newName: any;
    let targetTenant: tenantModel;

    try {
      if (updateTenantDto.email !== null) {
        newEmail = updateTenantDto.email;
        targetTenant = await this.findByEmail(newEmail);
        if (targetTenant && targetTenant.email === newEmail) {
          throw new ConflictException('Email already exists, try to login');
        }
      }

      if (updateTenantDto.name !== null) {
        newName = updateTenantDto.name;
        const tenants = await this.findAll();
        for (const item of tenants) {
          if (item.name === newName) {
            throw new ConflictException('Name already in use, try another one');
          }
        }
      }

      const tenantAfterUpdate = await this.tenantModel
        .findOneAndUpdate({ _id: id, deleted: false }, updateTenantDto, {
          new: true,
        })
        .exec();

      if (!tenantAfterUpdate) {
        throw new NotFoundException('Tenant not found or already deleted');
      }

      return tenantAfterUpdate;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        console.error('Error updating tenant:', error);
        throw new InternalServerErrorException('Failed to update tenant');
      }
    }
  }

  async updateWithPassword(
    id: string,
    updateTenantDto: updateTenantModel,
  ): Promise<any> {
    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    try {
      if (updateTenantDto.email !== null) {
        const newEmail = updateTenantDto.email;
        const targetTenant = await this.findByEmail(newEmail);
        if (targetTenant && targetTenant.email === newEmail) {
          throw new ConflictException('Email already exists, try to login');
        }
      }

      if (updateTenantDto.name !== null) {
        const newName = updateTenantDto.name;
        const tenants = await this.findAll();
        if (tenants.some((item) => item.name === newName)) {
          throw new ConflictException('Name already in use, try another one');
        }
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
        if (
          updateTenantDto.newPassword !== updateTenantDto.confirmNewPassword
        ) {
          throw new BadRequestException('New passwords do not match');
        }
        const salt = await bcrypt.genSalt();
        tenant.password = await bcrypt.hash(updateTenantDto.newPassword, salt);
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

  async remove(id: string): Promise<any> {
    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    tenant.deleted = true;
    await tenant.save({ validateModifiedOnly: true });
    return tenant;
  }

  async undelete(id: string): Promise<any> {
    const tenant = await this.tenantModel.findById(id).exec();
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
    const tenant = await this.tenantModel
      .findOne({
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

  async addImage(id: string, image: Express.Multer.File): Promise<Tenant> {
    const tenant = await this.tenantModel.findById(id).exec();

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    await this.imageService.upload('tenants', id, image);

    tenant.image =
      jwtConstants.imageUrl + 'tenants/' + `${id}/` + image.originalname;

    return tenant.save();
  }


  async findTenantByProjectId(projectId: string): Promise<any | null> {
    return this.tenantModel.findOne({ 'projects._id': projectId }).exec();
  }
}
