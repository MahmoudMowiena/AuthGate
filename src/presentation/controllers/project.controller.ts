import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { projectModel } from '../dtos/project.model';
import { Project } from 'src/domain/entities/project.entity';
import { ProjectService } from 'src/infrastructure/services/project.service';
import { JwtService } from '@nestjs/jwt';
import { TenantsService } from 'src/infrastructure/services/tenants.service';
import { UsersService } from 'src/infrastructure/services/users.service';
import { jwtConstants } from 'src/constants';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly jwtService: JwtService,
    private readonly tenantservice: TenantsService,
    private readonly userservice: UsersService,
  ) {}

  @Post()
  async create(
    @Body() createProjectDto: projectModel,
    @Headers('Authorization') authHeader: string,
  ): Promise<projectModel> {
    const payload = await this.verifyTokenAndGetPayload(authHeader);
    const tenantID = payload.sub;
    const projetListCreated: any = await this.projectService.create(
      createProjectDto,
      tenantID,
    );
    return projetListCreated;
  }

  @Get()
  async getAll(
    @Headers('Authorization') authHeader: string,
  ): Promise<projectModel[]> {
    let payload = await this.verifyTokenAndGetPayload(authHeader);
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

  @Get('tenantProjects')
  async getAllPerTenant(
    @Headers('Authorization') authHeader: string,
  ): Promise<Project[]> {
    const payload = await this.verifyTokenAndGetPayload(authHeader);
    const tenantID = payload.sub;
    return await this.projectService.findAllProjectsPerTenant(tenantID);
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
  ): Promise<projectModel> {
    const payload = await this.verifyTokenAndGetPayload(authHeader);
    const tenantID = payload.sub;
    const projectList: any = await this.projectService.update(
      id,
      updateProjectDto,
      tenantID,
    );
    return projectList;
  }

  @Patch('undelete/:id')
  async undelete(
    @Param('id') id: string,
    @Headers('Authorization') authHeader: string,
  ): Promise<projectModel> {
    const payload = await this.verifyTokenAndGetPayload(authHeader);
    const userID = payload.sub;
    const user = await this.userservice.findById(userID);

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

  // @Delete(':id')
  // async remove(
  //   @Param('id') id: string,
  //   @Headers('Authorization') authHeader: string,
  // ): Promise<projectModel[]> {
  //   let tenant: any = '';
  //   const payload = await this.verifyTokenAndGetPayload(authHeader);
  //   const userID = payload.sub;
  //   const user = await this.tenantservice.findById(userID);
  //   if (user && user.role === 'tenant') {
  //     return await this.projectService.delete(id, userID);
  //   } else {
  //     const user = await this.userservice.findById(userID);

  //     if (user && user.role === 'admin') {
  //       tenant = await this.tenantservice.findTenantByProjectId(id);
  //       if (!tenant) {
  //         throw new NotFoundException('Tenant not found for given project ID');
  //       }
  //       let tenantId = tenant._id;
  //       return await this.projectService.delete(id, tenantId);
  //     }
  //   }
  // }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('Authorization') authHeader: string,
  ): Promise<projectModel[]> {
    let tenant: any = '';
    const payload = await this.verifyTokenAndGetPayload(authHeader);
    const userID = payload.sub;

    const tenantUser = await this.tenantservice.findById(userID);
    if (tenantUser) {
      if (tenantUser.role === 'tenant') {
        return await this.projectService.delete(id, userID);
      } else {
        throw new ConflictException(
          "You can't delete the project because of role authorization",
        );
      }
    }

    const adminUser = await this.userservice.findById(userID);
    if (adminUser && adminUser.role === 'admin') {
      tenant = await this.tenantservice.findTenantByProjectId(id);
      if (!tenant) {
        throw new NotFoundException('Tenant not found for given project ID');
      }
      const tenantId = tenant._id;
      return await this.projectService.delete(id, tenantId);
    }

    throw new ConflictException(
      "You can't delete the project because of role authorization",
    );
  }

  private async verifyTokenAndGetPayload(authHeader: string): Promise<any> {
    try {
      const token = authHeader.split(' ')[1];
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
