import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from "@nestjs/common";
import { projectModel } from "../dtos/project.model";
import { Project } from "src/domain/entities/project.entity";
import { ProjectService } from "src/infrastructure/services/project.service";
import { AuthGuard } from "../guards/auth.guard";


@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Body() createProjectDto: projectModel, @Request() req): Promise<Project> {
    const tenantID = req.user.id; 
    return await this.projectService.create(createProjectDto, tenantID);
  }

  @Get()
  async findAll(): Promise<Project[]> {
    return await this.projectService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Project> {
    return await this.projectService.findOne(id);
  }

  // @Get('clientid/:clientID')
  // async findByClientID(@Param('clientID') clientID: string): Promise<{ projectID: string }> {
  //   const projectID = await this.projectService.findProjectIDByClientID(clientID);
  //   return { projectID };
  // }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProjectDto: projectModel, @Request() req): Promise<Project> {
    const tenantID = req.user.id;
    return await this.projectService.update(id, updateProjectDto, tenantID);
  }
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<Project> {
    const tenantID = req.user.id;
    return await this.projectService.delete(id, tenantID);
  }
  



}