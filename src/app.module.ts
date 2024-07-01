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
    //MongooseModule.forRoot('mongodb://localhost:27017'),
    MongooseModule.forRoot('mongodb://mowiena8:zG8NfJYpJTkXtXK9@ac-flhrjff-shard-00-00.0e2el9i.mongodb.net:27017,ac-flhrjff-shard-00-01.0e2el9i.mongodb.net:27017,ac-flhrjff-shard-00-02.0e2el9i.mongodb.net:27017/?replicaSet=atlas-h2rep0-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=AuthGate'),
    UserModule,
    ProjectsModule,
    TenantModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
