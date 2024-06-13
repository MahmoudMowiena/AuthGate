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

    async create(createProjectDto: projectModel): Promise<Project> {
        const { tenantID, name, callBackUrl } = createProjectDto;

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

    async update(id: string, updateProjectDto: projectModel): Promise<Project> {
        try {
            const updatedProject = await this.projectModel.findByIdAndUpdate(id, updateProjectDto, { new: true });
            if (!updatedProject) {
                throw new NotFoundException(`Project with ID: ${id} not found for update`);
            }
            return updatedProject;
        } catch (error) {
            throw new BadRequestException('Failed to update project');
        }
    }

    async delete(id: string): Promise<Project> {
        try {
            const deletedProject = await this.projectModel.findByIdAndDelete(id);
            if (!deletedProject) {
                throw new NotFoundException(`Project with ID: ${id} not found for deletion`);
            }
            return deletedProject;
        } catch (error) {
            throw new BadRequestException('Failed to delete project');
        }
    }


    
}
