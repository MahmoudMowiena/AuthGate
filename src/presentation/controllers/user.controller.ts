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
      console.log('hi from the try of add User Project');
      const token = authHeader.split(' ')[1];
      console.log(
        'hi from the try of add User Project after extracting the token',
      );
      console.log(token);
      const { projectId } = body;
      console.log(projectId);
      const result = await this.authservice.processAuth(projectId, token);
      console.log('hello after awiat');
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
      return updatedUser;
    } catch (error) {
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  async remove(@Headers('Authorization') authHeader: any): Promise<userModel> {
    try {
      const token = authHeader.split(' ')[1];
      const userId = this.jwtservice.verify(token).sub;
      const user = await this.userService.remove(userId);
      if (!user) {
        throw new HttpException('user not found', HttpStatus.NOT_FOUND);
      }
      return user;
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
