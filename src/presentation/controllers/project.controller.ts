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
import { userModel } from '../dtos/user.model';

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
    const neededTenant = await this.tenantservice.findById(tenantID);

    const oldname = neededTenant.projects.find(
      (pro) => pro._id.toString() === id,
    ).name;

    const projectList: any = await this.projectService.update(
      id,
      updateProjectDto,
      neededTenant,
    );

    if (projectList && neededTenant) {
      const neededProject = neededTenant.projects.find(
        (pro) => pro._id.toString() === id,
      );

      if (neededProject && oldname !== updateProjectDto.name) {
        const users: any[] = await this.userservice.findAll();

        for (const item of users) {
          const projectFound = item.projects.find(
            (pro) => pro.projectID === id,
          );

          if (projectFound) {
            projectFound.name = updateProjectDto.name;
            await item.save(); // Save the user to persist changes
          }
        }
      }
    }

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
        const projectList = await this.projectService.delete(id, userID);
        if (projectList) {
          await this.deleteProjectFromUsers(id);
        }
        return projectList;
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
      const projectList = await this.projectService.delete(id, tenantId);
      if (projectList) {
        await this.deleteProjectFromUsers(id);
      }
      return projectList;
    }

    throw new ConflictException(
      "You can't delete the project because of role authorization",
    );
  }

  private async deleteProjectFromUsers(
    projectId: string,
  ): Promise<userModel[]> {
    let users: any[] = await this.userservice.findAll();
    if (users) {
      for (let item of users) {
        let itemProject = item.projects.find(
          (pro) => pro.projectID === projectId,
        );
        if (itemProject) {
          itemProject.deleted = true;
          item.save();
        }
      }
    }
    return;
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
