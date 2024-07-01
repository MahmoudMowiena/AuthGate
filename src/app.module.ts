import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user.module';
import { TenantModule } from './modules/tenant.module';
import { ProjectsModule } from './modules/project.module';
import { AuthModule } from './modules/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    //MongooseModule.forRoot('mongodb://localhost:27017/AuthGate'),
    MongooseModule.forRoot(process.env.MONGO_DB_CONNECTION_STRING),
    UserModule,
    ProjectsModule,
    TenantModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
