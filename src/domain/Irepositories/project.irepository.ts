import { projectModel } from "src/presentation/dtos/project.model";
import { Project } from "../entities/project.entity";


export interface IProjectRepository {
    create(createProjectDto: projectModel): Promise<Project>;

    findAll(): Promise<Project[]>;

    findOne(id: string): Promise<Project>;
}