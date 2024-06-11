import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Project } from "src/domain/entities/project.entity";
import { projectModel } from "src/presentation/dtos/project.model";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProjectService {
    constructor(@InjectModel(Project.name) private readonly projectModel: Model<Project>) { }

    async create(createProjectDto: projectModel): Promise<Project> {
        const createdProject = new this.projectModel(createProjectDto);

        const clientID = uuidv4();
        const clientSECRET = uuidv4();

        createdProject.clientID = clientID;
        createdProject.clientSECRET = clientSECRET;
        return createdProject.save();
    }

    async findAll(): Promise<Project[]> {
        return await this.projectModel.find();
    }

    async findOne(id: string): Promise<Project> {
        return await this.projectModel.findById(id);
    }

}
