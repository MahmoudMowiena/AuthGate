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
  UseInterceptors,
  UploadedFile,
  Headers,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { tenantModel } from '../dtos/tenant.model';
import { TenantsService } from 'src/infrastructure/services/tenants.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { updateTenantModel } from '../dtos/updateTenant.model';
import { jwtConstants } from 'src/constants';

@Controller('tenants')
export class TenantController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly jwtservice: JwtService,
  ) {}

  @Get()
  async findAll(): Promise<tenantModel[]> {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<tenantModel> {
    const tenant = await this.tenantsService.findById(id);
    if (!tenant) {
      throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
    }
    return tenant;
  }

  @Get('email/:email')
  async getByEmail(@Param('email') email: string): Promise<tenantModel> {
    const tenant = await this.tenantsService.findByEmail(email);
    if (!tenant) {
      throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
    }
    return tenant;
  }

  @Patch()
  async update(
    @Body() updateTenantDto: tenantModel,
    @Headers('Authorization') authHeader: any,
  ): Promise<tenantModel> {
    try {
      const payload = await this.verifyTokenAndGetPayload(authHeader);
      const tenantId = payload.sub;
      const updatedTenant = await this.tenantsService.update(
        tenantId,
        updateTenantDto,
      );
      if (!updatedTenant) {
        throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
      }
      return updatedTenant;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw new HttpException(
        error.message || 'Failed to update tenant',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('updateWithPassword')
  async updateWithPassword(
    @Body() updateTenantDto: updateTenantModel,
    @Headers('Authorization') authHeader: any,
  ): Promise<tenantModel> {
    try {
      const payload = await this.verifyTokenAndGetPayload(authHeader);
      const tenantId = payload.sub;
      const updatedTenant = await this.tenantsService.updateWithPassword(
        tenantId,
        updateTenantDto,
      );
      if (!updatedTenant) {
        throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
      }
      return updatedTenant;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update tenant',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('undelete/:id')
  async undelete(
    @Param('id') id: string,
    @Headers('Authorization') authHeader: string,
  ): Promise<tenantModel[]> {
    try {
      const payload = await this.verifyTokenAndGetPayload(authHeader);
      if (payload.role === 'admin') {
        const tenant = await this.tenantsService.undelete(id);
        if (!tenant) {
          throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
        }
        return await this.findAll();
      }
    } catch (error) {
      throw new HttpException(
        'Failed to undelete tenant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<tenantModel[]> {
    try {
      const tenant = await this.tenantsService.remove(id);
      if (!tenant) {
        throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
      }
      return await this.findAll();
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

  @Post('image/:id')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return await this.tenantsService.addImage(id, image);
  }

  async getTenantByProjectId(projectId: string): Promise<tenantModel> {
    const tenant = await this.tenantsService.findTenantByProjectId(projectId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  private async verifyTokenAndGetPayload(authHeader: string): Promise<any> {
    try {
      const token = authHeader.split(' ')[1];
      const payload = await this.jwtservice.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
