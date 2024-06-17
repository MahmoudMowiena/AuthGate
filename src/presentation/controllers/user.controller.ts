import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { userModel } from '../dtos/user.model';
import { UsersService } from 'src/infrastructure/services/users.service';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { ImageService } from 'src/infrastructure/services/image.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { updateUserModel } from '../dtos/updateUser.model';

@Controller('users')
export class UserController {
  constructor(
    private userService: UsersService,
    private authservice: AuthService,
    private imageService: ImageService,
    private jwtservice: JwtService,
  ) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      const user = await this.userService.findById(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('email/:email')
  async getByEmail(@Param('email') email: string) {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async adduserProjectByProjectId(
    @Body() body: { projectId: string },
    @Headers('Authorization') authHeader: string,
  ) {
    try {
      const token = authHeader.split(' ')[1];
      const { projectId } = body;
      const result = await this.authservice.processAuth(projectId, token);
      return {
        result,
        success: true,
        message: 'Project Added successfully',
      };
    } catch (error) {
      throw new Error('Error Adding Project');
    }
  }

  @Patch()
  async update(
    @Body() updateUserDto: userModel,
    @Headers('Authorization') authHeader: any,
  ): Promise<userModel> {
    try {
      const token = authHeader.split(' ')[1];
      const userId = this.jwtservice.verify(token).sub;
      const updatedUser = await this.userService.update(userId, updateUserDto);
      if (!updatedUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const usersListAfterUpdate: any = await this.findAll();
      return usersListAfterUpdate;
    } catch (error) {
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('updateWithPassword')
  async updateWithPassword(
    @Body() updateUserDto: updateUserModel,
    @Headers('Authorization') authHeader: any,
  ): Promise<userModel> {
    try {
      const token = authHeader.split(' ')[1];
      const userId = this.jwtservice.verify(token).sub;
      const updatedUser = await this.userService.updateWithPassword(
        userId,
        updateUserDto,
      );
      if (!updatedUser) {
        throw new HttpException('user not found', HttpStatus.NOT_FOUND);
      }
      const userListAfterUpdate: any = await this.findAll();
      return userListAfterUpdate;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<userModel> {
    try {
      const user = await this.userService.remove(id);
      if (!user) {
        throw new HttpException('user not found', HttpStatus.NOT_FOUND);
      }
      const usersListAfterDelete: any = await this.findAll();
      return usersListAfterDelete;
    } catch (error) {
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('image/:id')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return await this.userService.addImage(id, image);
  }
}
