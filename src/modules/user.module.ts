import { Schema } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { User, userSchema } from '../domain/entities/user.entity';
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { UserController } from '../presentation/controllers/user.controller';

@Module({
    imports:[
        MongooseModule.forFeature([
            {name:User.name,schema:userSchema}
    ])
    ],
    providers:[UserRepository],
    controllers:[UserController]
})
export class UserModule {}