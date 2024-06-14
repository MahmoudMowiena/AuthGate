import { Body, Controller, Delete, Get, Header, Headers, Param, Post, Put, Request, UseGuards } from "@nestjs/common";
import { projectModel } from "../dtos/project.model";
import { Project } from "src/domain/entities/project.entity";
import { ProjectService } from "src/infrastructure/services/project.service";
import { AuthGuard } from "../guards/auth.guard";


@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Body() createProjectDto: projectModel, @Headers() head): Promise<Project> {
    const tenantID = head.user.id; 
    return await this.projectService.create(createProjectDto, tenantID);
  }


  @Get()
  async findAll(@Headers() head): Promise<Project[]> {
   
    const tenantID = head.user.tenantId;
    return await this.projectService.findAll(tenantID);
  }

  @Get(':id')
  async findOne(@Headers() head , @Param('id') id: string): Promise<Project> {
    const tenantID ="666b55375655c9f3f0040105"; 
    // const tenantID = head.user.tenantId;
    return await this.projectService.findOne(tenantID, id);
  }
  

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProjectDto: projectModel, @Headers() head): Promise<Project> {
    const tenantID = head.user.id;
    return await this.projectService.update(id, updateProjectDto, tenantID);
  }
  @Delete(':id')
  async remove(@Param('id') id: string, @Headers() head): Promise<Project> {
    const tenantID = head.user.id;
    return await this.projectService.delete(id, tenantID);
  }
  



}