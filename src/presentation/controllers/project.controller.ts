import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { projectModel } from "../dtos/project.model";
import { Project } from "src/domain/entities/project.entity";
import { ProjectService } from "src/infrastructure/services/project.service";


@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Body() createProjectDto: projectModel): Promise<Project> {
    return await this.projectService.create(createProjectDto);
  }

  @Get()
  async findAll(): Promise<Project[]> {
    return await this.projectService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Project> {
    return await this.projectService.findOne(id);
  }
}