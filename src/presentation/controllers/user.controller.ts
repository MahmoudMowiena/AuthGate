import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnauthorizedException,
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
import { ProjectService } from 'src/infrastructure/services/project.service';
import { jwtConstants } from 'src/constants';
import { User } from 'src/domain/entities/user.entity';

@Controller('users')
export class UserController {
  constructor(
    private userService: UsersService,
    private authservice: AuthService,
    private imageService: ImageService,
    private jwtservice: JwtService,
    private projectservice: ProjectService,
  ) {}

  @Get()
  findAll(): Promise<userModel[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<userModel> {
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

  @Get('projects/:id')
  async getByIdWithProjects(@Param('id') id: string): Promise<userModel> {
    try {
      const user = await this.userService.findByIdWithProjects(id);
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
  async getByEmail(@Param('email') email: string): Promise<userModel> {
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
  async addProjectToUserByProjectId(
    @Body() body: { projectId: string; codeChallenge: string },
    @Headers('Authorization') authHeader: string,
  ): Promise<any> {
    try {
      const { projectId, codeChallenge } = body;
      const payload = await this.verifyTokenAndGetPayload(authHeader);
      const userId = payload.sub;
      let result;

      const targetProject = await this.projectservice.findOne(projectId);
      if (targetProject.deleted === false) {
        const projectName = targetProject.name;
        result = await this.authservice.processAuth(
          projectId,
          userId,
          projectName,
          codeChallenge,
        );
      } else {
        throw new HttpException(
          'project not found, or has been deleted',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        result,
        success: true,
        message: 'Project Added successfully',
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw new HttpException(
        error.message || 'Failed to add project',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch()
  async update(
    @Body() updateUserDto: userModel,
    @Headers('Authorization') authHeader: any,
  ): Promise<userModel> {
    try {
      const payload = await this.verifyTokenAndGetPayload(authHeader);
      const userId = payload.sub;
      const updatedUser = await this.userService.update(userId, updateUserDto);
      if (!updatedUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return updatedUser;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('updateWithPassword')
  async updateWithPassword(
    @Body() updateUserDto: updateUserModel,
    @Headers('Authorization') authHeader: any,
  ): Promise<userModel> {
    try {
      const payload = await this.verifyTokenAndGetPayload(authHeader);
      const userId = payload.sub;
      const updatedUser = await this.userService.updateWithPassword(
        userId,
        updateUserDto,
      );
      if (!updatedUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return updatedUser;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('undelete/:id')
  async undelete(
    @Param('id') id: string,
    @Headers('Authorization') authHeader: string,
  ): Promise<userModel[]> {
    try {
      const payload = await this.verifyTokenAndGetPayload(authHeader);
      if (payload.role === 'admin') {
        const user = await this.userService.undelete(id);
        if (!user) {
          throw new HttpException('user not found', HttpStatus.NOT_FOUND);
        }
        return await this.findAll();
      }
    } catch (error) {
      throw new HttpException(
        'Failed to undelete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<userModel[]> {
    try {
      const user = await this.userService.remove(id);
      if (!user) {
        throw new HttpException('user not found', HttpStatus.NOT_FOUND);
      }
      return await this.findAll();
    } catch (error) {
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('project/:id')
  async removeProject(
    @Param('id') id: string,
    @Headers('Authorization') authHeader: string,
  ): Promise<userModel> {
    let targetUser: any = '';
    const payload = await this.verifyTokenAndGetPayload(authHeader);
    const userID = payload.sub;
    const user = await this.userService.findById(userID);
    if (user && user.role === 'user') {
      return await this.userService.delete(id, userID);
    } else {
      if (user && user.role === 'admin') {
        targetUser = await this.userService.findUserByProjectId(id);
        if (!targetUser) {
          throw new NotFoundException('User not found for given project ID');
        }
        let targetUserId = targetUser._id;
        return await this.userService.delete(id, targetUserId);
      }
    }
  }

  @Patch('undelete-project/:id')
  async unremove(
    @Param('id') id: string,
    @Headers('Authorization') authHeader: string,
  ): Promise<userModel> {
    try {
      let targetUser: any = '';
      const payload = await this.verifyTokenAndGetPayload(authHeader);
      if (payload.role === 'admin') {
        targetUser = await this.userService.findUserByProjectId(id);
        if (!targetUser) {
          throw new NotFoundException('User not found for given project ID');
        }
        let targetUserId = targetUser._id;
        const user = await this.userService.unremove(id, targetUserId);
        if (!user) {
          throw new HttpException('user not found', HttpStatus.NOT_FOUND);
        }

        return user;
      }
    } catch (error) {
      throw new HttpException(
        'Failed to undelete the project of this user',
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

  private async verifyTokenAndGetPayload(authHeader: string): Promise<any> {
    try {
      const token = authHeader.split(' ')[1];
      const payload = await this.jwtservice.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
