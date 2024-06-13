import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { userModel } from '../dtos/user.model';
import { UsersService } from 'src/infrastructure/services/users.service';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UserController {
  constructor(
    private userService: UsersService,
    private authservice: AuthService,
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
  async adduserProjectByProjectId(@Body() body: { projectId: string }) {
    try {
      const { projectId } = body;
      await this.authservice.processAuth(projectId);
      return {
        success: true,
        message: 'Project Added successfully',
      };
    } catch (error) {
      throw new Error('Error Adding Project');
    }
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() updateUserDto: userModel) {
    try {
      const updatedUser = await this.userService.update(id, updateUserDto);
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

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const user = await this.userService.remove(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // @Patch()
  // @UseGuards(AuthGuard)
  // async update(
  //   @Body() updateUserDto: userModel,
  //   @Request() req: any,
  // ): Promise<userModel> {
  //   try {
  //     const userId = req.user.userId;
  //     const updatedUser = await this.userService.update(userId, updateUserDto);
  //     if (!updatedUser) {
  //       throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  //     }
  //     return updatedUser;
  //   } catch (error) {
  //     throw new HttpException(
  //       'Failed to update user',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // @Delete()
  // @UseGuards(AuthGuard)
  // async remove(@Request() req: any): Promise<userModel> {
  //   try {
  //     const userId = req.user.userId;
  //     const user = await this.userService.remove(userId);
  //     if (!user) {
  //       throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  //     }
  //     return user;
  //   } catch (error) {
  //     throw new HttpException(
  //       'Failed to delete user',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
}
