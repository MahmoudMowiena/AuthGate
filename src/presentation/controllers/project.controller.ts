import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ProjectsRepository } from "src/infrastructure/repositories/project.repository";
import { projectModel } from "../dtos/project.model";
import { Project } from "src/domain/entities/project.entity";



@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  @Post()
  async create(@Body() createProjectDto: projectModel): Promise<Project> {
    return await this.projectsRepository.create(createProjectDto);
  }

  @Get()
  async findAll(): Promise<Project[]> {
    return await this.projectsRepository.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Project> {
    return await this.projectsRepository.findOne(id);
  }
}