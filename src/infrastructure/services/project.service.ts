import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from 'src/domain/entities/project.entity';
import { Tenant } from 'src/domain/entities/tenant.entity';
import { projectModel } from 'src/presentation/dtos/project.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
  ) {}

  async create(
    createProjectDto: projectModel,
    tenantID: string,
  ): Promise<Project> {
    const { name, callBackUrl } = createProjectDto;
    const tenant = await this.tenantModel.findById(tenantID);
    console.log(tenant);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantID} not found`);
    }

    const clientID = uuidv4();
    const clientSECRET = uuidv4();

    const createdProject = new this.projectModel({
      tenantID,
      clientID,
      clientSECRET,
      name,
      callBackUrl,
    });
    console.log(createdProject);
    try {
      tenant.projects.push(createdProject);
      await tenant.save();
      const allProjetcs: any = tenant.projects;
      return allProjetcs;
    } catch (error) {
      throw new BadRequestException('Failed to create project');
    }
  }

  async findAll(tenantID: string): Promise<Project[]> {
    const tenant = await this.tenantModel.findById(tenantID);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID: ${tenantID} not found`);
    }
    return tenant.projects;
  }

  async findOne(tenantID: string, projectID: string): Promise<Project> {
    const tenant = await this.tenantModel.findById(tenantID);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID: ${tenantID} not found`);
    }

    const project = tenant.projects.find(
      (proj) => proj._id.toString() === projectID,
    );
    if (!project) {
      throw new NotFoundException(
        `Project with ID: ${projectID} not found in tenant`,
      );
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: projectModel,
    tenantID: string,
  ): Promise<Project> {
    const tenant = await this.tenantModel.findById(tenantID);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID: ${tenantID} not found`);
    }

    const project = tenant.projects.find((proj) => proj._id.toString() === id);
    if (!project) {
      throw new NotFoundException(`Project with ID: ${id} not found in tenant`);
    }

    Object.assign(project, updateProjectDto);

    try {
      await tenant.save();
      const projectsAfterUpdate: any = tenant.projects;
      return projectsAfterUpdate;
    } catch (error) {
      throw new BadRequestException('Failed to update project');
    }
  }

  async delete(id: string, tenantID: string): Promise<Project> {
    const tenant = await this.tenantModel.findById(tenantID);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID: ${tenantID} not found`);
    }

    const projectIndex = tenant.projects.findIndex(
      (proj) => proj._id.toString() === id,
    );
    if (projectIndex === -1) {
      throw new NotFoundException(`Project with ID: ${id} not found in tenant`);
    }

    const project = tenant.projects.splice(projectIndex, 1)[0];

    try {
      await tenant.save();
      const projectsAfterDelete: any = tenant.projects;
      return projectsAfterDelete;
    } catch (error) {
      throw new BadRequestException('Failed to delete project');
    }
  }
}
