import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, projectSchema } from 'src/domain/entities/project.entity';
import { ProjectsRepository } from 'src/infrastructure/repositories/project.repository';
import { ProjectsController } from 'src/presentation/controllers/project.controller';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: projectSchema }]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsRepository],
})
export class ProjectsModule {}