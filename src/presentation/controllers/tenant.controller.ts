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
  UseGuards,
  Request,
  Header,
} from '@nestjs/common';
import { tenantModel } from '../dtos/tenant.model';
import { TenantsService } from 'src/infrastructure/services/tenants.service';
import { ProjectService } from 'src/infrastructure/services/project.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { JwtService } from '@nestjs/jwt';

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
    @Headers('Authorization') authHeader: any,
  ): Promise<tenantModel> {
    try {
      const token = authHeader.split(' ')[1];
      const tenantId = this.jwtservice.verify(token).sub;
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
  async remove(
    @Headers('Authorization') authHeader: any,
  ): Promise<tenantModel> {
    try {
      const token = authHeader.split(' ')[1];
      const tenantId = this.jwtservice.verify(token).sub;
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

  @Post('image/:id')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return await this.tenantsService.addImage(id, image);
  }
}
