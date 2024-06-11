import { Controller, Get, Post, Body, Patch, Param, Delete, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { tenantModel } from '../dtos/tenant.model';
import { TenantRepository } from 'src/infrastructure/repositories/tenant.repository';
import { TenantDocument } from 'src/domain/entities/tenant.entity';
//import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantRepository: TenantRepository) {}

  @Post('signup')
  async signUp(@Body() createTenantDto: tenantModel): Promise<tenantModel> {
    const { email, password, confirmPassword } = createTenantDto;

    const existingTenant = await this.tenantRepository.findByEmail(email);
    if (existingTenant) {
      throw new ConflictException('Email already in use. Please go to login.');
    }

    if (password !== confirmPassword) {
      throw new ConflictException('Passwords do not match');
    }

    const newTenant = new tenantModel();
    Object.assign(newTenant, createTenantDto);
    return this.tenantRepository.create(newTenant);
  }

  @Get()
  async findAll(): Promise<tenantModel[]> {
    return this.tenantRepository.findAll();
  }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
//     return this.tenantService.update(+id, updateTenantDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.tenantService.remove(+id);
//   }
}
