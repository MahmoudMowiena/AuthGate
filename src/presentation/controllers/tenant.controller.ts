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
  Headers,
  UseGuards,
  Request,
} from '@nestjs/common';
import { tenantModel } from '../dtos/tenant.model';
import { TenantsService } from 'src/infrastructure/services/tenants.service';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from 'src/infrastructure/services/auth.service';

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

  @Patch()
  @UseGuards(AuthGuard)
  async update(
    @Body() updateTenantDto: tenantModel,
    @Request() req: any,
  ): Promise<tenantModel> {
    try {
      const tenantId = req.user.tenantId;
      const updatedTenant = await this.tenantsService.update(
        tenantId,
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

  @Delete()
  @UseGuards(AuthGuard)
  async remove(@Request() req: any): Promise<tenantModel> {
    try {
      const tenantId = req.user.tenantId;
      const tenant = await this.tenantsService.remove(tenantId);
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

  @Post('authorize-client')
  async authorizeClient(
    @Body('clientID') clientID: string,
    @Body('clientSECRET') clientSECRET: string,
  ): Promise<{ callbackUrl: string }> {
    try {
      const projectId = await this.tenantsService.authorizeClient(
        clientID,
        clientSECRET,
      );
      const frontendURL = 'http://localhost:4200/authorize/';
      const callbackUrl = frontendURL + projectId;
      return { callbackUrl };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
}
