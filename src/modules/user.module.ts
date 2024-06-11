import { Schema } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { User, userSchema } from '../domain/entities/user.entity';
import { UserController } from '../presentation/controllers/user.controller';
import { UsersService } from 'src/infrastructure/services/users.service';

@Module({
    imports:[
        MongooseModule.forFeature([
            {name:User.name,schema:userSchema}
    ])
    ],
    providers:[UsersService],
    controllers:[UserController],
    exports: [UsersService],
})
export class UserModule {}