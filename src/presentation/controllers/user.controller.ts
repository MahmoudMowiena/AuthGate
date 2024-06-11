import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { userModel } from "../dtos/user.model";
import { UserRepository } from "src/infrastructure/repositories/user.repository";

@Controller('user')
export class UserController {
    constructor(private userRepository:UserRepository){}
    @Post()
    @UsePipes(new ValidationPipe())
    createUser(@Body() createUserDto:userModel){
        return this.userRepository.create(createUserDto);
    }

    @Get()
    findAll() {
    return this.userRepository.findAll();
    }
}