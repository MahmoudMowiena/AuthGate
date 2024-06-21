import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { projectModel } from '../dtos/project.model';
import { Project } from 'src/domain/entities/project.entity';
import { ProjectService } from 'src/infrastructure/services/project.service';
import { AuthenticationGuard } from '../guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { TenantsService } from 'src/infrastructure/services/tenants.service';
import { UsersService } from 'src/infrastructure/services/users.service';

@Controller('projects')
//@UseGuards(AuthenticationGuard)
export class ProjectsController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly jwtService: JwtService,
    private readonly tenantservice: TenantsService,
    private readonly userservice: UsersService,
  ) {}

  private extractTenantId(authHeader: string): string {
    const token = authHeader.split(' ')[1];
    const payload = this.jwtService.verify(token);
    return payload.sub;
  }

  @Post()
  async create(
    @Body() createProjectDto: projectModel,
    @Headers('Authorization') authHeader: string,
  ): Promise<any> {
    const tenantID = this.extractTenantId(authHeader);
    const createdProjetc: any = await this.projectService.create(
      createProjectDto,
      tenantID,
    );
    return createdProjetc;
  }
  //
  @Get()
  async getAll(@Headers('Authorization') authHeader: string): Promise<any> {
    const token = authHeader.split(' ')[1];
    let payload = this.jwtService.verify(token);
    let role = payload.role;
    if (role === 'admin') {
      const tenants = await this.tenantservice.findAll();
      let projectList: any[] = [];
      for (let item of tenants) {
        if (item.projects.length >= 1) projectList.push(item);
      }
      return projectList;
    }
  }

  @Get(':targetTenant')
  async getAllPerTenant(
    @Headers('Authorization') authHeader: string,
  ): Promise<Project[]> {
    const tenantID = this.extractTenantId(authHeader);
    return await this.projectService.findAllPerTenant(tenantID);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Project> {
    return await this.projectService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: projectModel,
    @Headers('Authorization') authHeader: string,
  ): Promise<any> {
    const tenantID = this.extractTenantId(authHeader);
    const projectList: any = await this.projectService.update(
      id,
      updateProjectDto,
      tenantID,
    );
    return projectList;
  }

  @Patch(':id/undelete')
  async undelete(
    @Param('id') id: string,
    @Headers('Authorization') authHeader: string,
  ): Promise<any> {
    const userID = this.extractTenantId(authHeader);
    const user = await this.tenantservice.findById(userID);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'admin') {
      const tenant = await this.tenantservice.findTenantByProjectId(id);
      if (!tenant) {
        throw new NotFoundException('Tenant not found for given project ID');
      }
      const tenantId = tenant._id;
      return await this.projectService.undelete(id, tenantId);
    } else {
      throw new BadRequestException('Only admins can undelete projects');
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('Authorization') authHeader: string,
  ): Promise<any> {
    let tenant: any = '';
    const userID = this.extractTenantId(authHeader);
    const user = await this.tenantservice.findById(userID);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'tenant') {
      return await this.projectService.delete(id, userID);
    } else if (user.role === 'admin') {
      tenant = await this.tenantservice.findTenantByProjectId(id);
      if (!tenant) {
        throw new NotFoundException('Tenant not found for given project ID');
      }
      let tenantId = tenant._id;
      return await this.projectService.delete(id, tenantId);
    } else {
      throw new BadRequestException('Invalid user role');
    }
  }
}
