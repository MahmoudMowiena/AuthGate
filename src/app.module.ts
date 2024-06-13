import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user.module';
import { TenantModule } from './modules/tenant.module';
import { ProjectsModule } from './modules/project.module';
import { AuthModule } from './modules/auth.module';


@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/AuthGate'),
    UserModule,
    ProjectsModule,
    TenantModule,
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}


// providers: [ProjectService, UsersService, TenantsService, AuthService],
