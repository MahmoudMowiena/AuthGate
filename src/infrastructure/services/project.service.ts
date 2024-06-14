import { Injectable, NotFoundException, BadRequestException,Inject, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Project } from "src/domain/entities/project.entity";
import { Tenant } from "src/domain/entities/tenant.entity";
import { projectModel } from "src/presentation/dtos/project.model";
import { v4 as uuidv4 } from 'uuid';
import { TenantsService } from "./tenants.service";

@Injectable()
export class ProjectService {
    constructor(
        @InjectModel(Project.name) private projectModel: Model<Project>,
        @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
        @Inject(forwardRef(() => TenantsService)) private tenantsService: TenantsService
    ) {}

    async create(createProjectDto: projectModel, tenantID: string): Promise<Project> {
        const { name, callBackUrl } = createProjectDto;
    
        const tenant = await this.tenantModel.findById(tenantID);
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
          callBackUrl
        });
    
        try {
          const project = await createdProject.save();
          tenant.projects.push(project);
          await tenant.save();
          return project;
        } catch (error) {
          throw new BadRequestException('Failed to create project');
        }
      }
    

    async findAll(): Promise<Project[]> {
        try {
            return await this.projectModel.find();
        } catch (error) {
            throw new BadRequestException('Failed to retrieve projects');
        }
    }

    async findOne(id: string): Promise<Project> {
        try {
            const project = await this.projectModel.findById(id);
            if (!project) {
                throw new NotFoundException(`Project with ID: ${id} not found`);
            }
            return project;
        } catch (error) {
            throw new NotFoundException(`Project with ID: ${id} not found`);
        }
    }

    // async findProjectIDByClientID(clientID: string): Promise<string> {
    //     const project = await this.projectModel.findOne({ clientID });
    //     if (!project) {
    //         throw new NotFoundException(`Project with clientID: ${clientID} not found`);
    //     }
    //     return project._id.toString();
    // }

    async update(id: string, updateProjectDto: projectModel, tenantID: string): Promise<Project> {
        const project = await this.projectModel.findOne({ _id: id, tenantID });
        if (!project) {
          throw new NotFoundException(`Project with ID: ${id} not found or not associated with the tenant`);
        }
    
        try {
          Object.assign(project, updateProjectDto);
          return await project.save();
        } catch (error) {
          throw new BadRequestException('Failed to update project');
        }
      }
    

      async delete(id: string, tenantID: string): Promise<Project> {
        const project = await this.projectModel.findOne({ _id: id, tenantID });
        if (!project) {
          throw new NotFoundException(`Project with ID: ${id} not found or not associated with the tenant`);
        }
    
        try {
            await this.projectModel.deleteOne({ _id: id, tenantID });
          return project;
        } catch (error) {
          throw new BadRequestException('Failed to delete project');
        }
      }

    
}
