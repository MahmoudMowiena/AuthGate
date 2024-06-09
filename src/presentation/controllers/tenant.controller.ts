import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { tenantModel } from '../dtos/tenant.model';
import { TenantRepository } from 'src/infrastructure/repositories/tenant.repository';
//import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantRepository: TenantRepository) {}

  @Post()
  create(@Body() createTenantDto: tenantModel) {
    return this.tenantRepository.create(createTenantDto);
  }

  @Get()
  findAll() {
    return this.tenantRepository.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantRepository.findOne(id);
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
