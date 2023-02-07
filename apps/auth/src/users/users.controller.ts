import {
  Body,
  Controller,
  HttpException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTeacherRequest } from './dto/create-teacher.request';
import { CreateUserRequest } from './dto/create-user.request';
import { UsersService } from './users.service';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  async createUser(@Body() request: { regdNo: string; password: string }) {
    try {
      const rawUser: any = await this.usersService.fetchDetailsFromIterServer(
        request.regdNo,
        request.password,
      );

      if (!rawUser.message) {
        const userObj: CreateUserRequest =
          await this.usersService.createUserObject(rawUser, request.password);
        return this.usersService.createUser(userObj);
      } else {
        return new UnauthorizedException(rawUser.message).getResponse();
      }
    } catch (error) {
      throw new HttpException('Failed to process the request.', 500, {
        cause: new Error(error),
      });
    }
  }

  @Post('teachers')
  async createTeacher(@Body() request: CreateTeacherRequest) {
    try {
      const regdNo: string = await this.usersService.createTeacher(request);
      return {
        statusCode: 201,
        message: `Registered successfully. Kindly verify you account to login.`,
        regdNo,
        error: null,
      };
    } catch (error) {
      throw new HttpException('Failed to process the request.', 500, {
        cause: new Error(error),
      });
    }
  }

  @Post('teachers/verify')
  async verifyTeacher(@Body() request: { regdNo: string; otp: number }) {
    try {
      const res = await this.usersService.validateOtp(request);
      return {
        ...res,
        error: null,
      };
    } catch (error) {
      throw new HttpException('Failed to process the request.', 500, {
        cause: new Error(error),
      });
    }
  }
}
