import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, projectSchema } from 'src/domain/entities/project.entity';
import { ProjectService } from 'src/infrastructure/services/project.service';
import { ProjectsController } from 'src/presentation/controllers/project.controller';
import { TenantModule } from './tenant.module';
import { UserModule } from './user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: projectSchema }]),
    forwardRef(() => TenantModule),
    forwardRef(() => UserModule),
  ],
  controllers: [ProjectsController],
  providers: [ProjectService],
  exports: [ProjectService, MongooseModule],
})
export class ProjectsModule {}
