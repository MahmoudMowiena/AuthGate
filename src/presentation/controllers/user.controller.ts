import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { userModel } from "../dtos/user.model";
import { UsersService } from "src/infrastructure/services/users.service";
import { AuthService } from "src/infrastructure/services/auth.service";

@Controller('users')
export class UserController {
    constructor(private userService: UsersService) { }

    @Get()
    findAll() {
        return this.userService.findAll();
    }
}