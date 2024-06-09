import { userModel } from "src/presentation/dtos/user.model";
import { User } from "../entities/user.entity";

export interface IUserRepository {
    create(createUserDto: userModel): Promise<User>;

    findAll(): Promise<User[]>;
    
    findOne(id: string): Promise<User>;
}
  