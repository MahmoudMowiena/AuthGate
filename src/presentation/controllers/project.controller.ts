import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Headers,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { projectModel } from '../dtos/project.model';
import { Project } from 'src/domain/entities/project.entity';
import { ProjectService } from 'src/infrastructure/services/project.service';
import { AuthGuard } from '../guards/auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly jwtService: JwtService,
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
    const allProjetcs: any = await this.projectService.create(
      createProjectDto,
      tenantID,
    );
    return allProjetcs;
  }

  @Get()
  async findAll(
    @Headers('Authorization') authHeader: string,
  ): Promise<Project[]> {
    const tenantID = this.extractTenantId(authHeader);
    return await this.projectService.findAll(tenantID);
  }

  @Get(':id')
  async findOne(
    @Headers('Authorization') authHeader: string,
    @Param('id') id: string,
  ): Promise<Project> {
    const tenantID = this.extractTenantId(authHeader);
    return await this.projectService.findOne(tenantID, id);
  }

  @Put(':id')
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

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('Authorization') authHeader: string,
  ): Promise<any> {
    const tenantID = this.extractTenantId(authHeader);
    const projectList: any = await this.projectService.delete(id, tenantID);
    return projectList;
  }
}
