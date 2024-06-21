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
      //const allProjetcs: any = tenant.projects;
      return createdProject;
    } catch (error) {
      throw new BadRequestException('Failed to create project');
    }
  }

  async findAllPerTenant(tenantID: string): Promise<Project[]> {
    const tenant = await this.tenantModel.findById(tenantID);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID: ${tenantID} not found`);
    }
    if (tenant.projects.length >= 1) {
      return tenant.projects;
    }
  }

  async findOne(projectID: string): Promise<Project> {
    const targetTenant = await this.tenantModel
      .findOne({ 'projects._id': projectID })
      .exec();

    const project = targetTenant.projects.find(
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
      //const projectsAfterUpdate: any = tenant.projects;
      return project;
    } catch (error) {
      throw new BadRequestException('Failed to update project');
    }
  }

  async undelete(id: string, tenantID: string): Promise<any> {
    const tenant = await this.tenantModel.findById(tenantID);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID: ${tenantID} not found`);
    }

    const project = tenant.projects.find((proj) => proj._id.toString() === id);
    if (!project) {
      throw new NotFoundException(`Project with ID: ${id} not found in tenant`);
    }

    project.deleted = false;
    try {
      await tenant.save();
      return tenant.projects;
    } catch (error) {
      throw new BadRequestException('Failed to undelete project');
    }
  }

  async delete(id: string, tenantID: string): Promise<any> {
    const tenant = await this.tenantModel.findById(tenantID);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID: ${tenantID} not found`);
    }

    if (!tenant.projects || !Array.isArray(tenant.projects)) {
      throw new BadRequestException(
        'Projects list is not available for this tenant',
      );
    }

    const project = tenant.projects.find((proj) => proj._id.toString() === id);
    if (!project) {
      throw new NotFoundException(`Project with ID: ${id} not found in tenant`);
    }

    project.deleted = true;
    try {
      await tenant.save();
      return tenant.projects;
    } catch (error) {
      throw new BadRequestException('Failed to delete project');
    }
  }
}
