import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { tenantModel } from '../dtos/tenant.model';
import { TenantsService } from 'src/infrastructure/services/tenants.service';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  async findAll(): Promise<tenantModel[]> {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<tenantModel> {
    try {
      const tenant = await this.tenantsService.findById(id);
      if (!tenant) {
        throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
      }
      return tenant;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve tenant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('email/:email')
  async getByEmail(@Param('email') email: string): Promise<tenantModel> {
    try {
      const tenant = await this.tenantsService.findByEmail(email);
      if (!tenant) {
        throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
      }
      return tenant;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve tenant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: tenantModel,
  ): Promise<tenantModel> {
    try {
      const updatedTenant = await this.tenantsService.update(
        id,
        updateTenantDto,
      );
      if (!updatedTenant) {
        throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
      }
      return updatedTenant;
    } catch (error) {
      throw new HttpException(
        'Failed to update tenant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<tenantModel> {
    try {
      const tenant = await this.tenantsService.remove(id);
      if (!tenant) {
        throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
      }
      return tenant;
    } catch (error) {
      throw new HttpException(
        'Failed to delete tenant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
