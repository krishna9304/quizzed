import { JwtAuthGuard, LowercasePipe, UppercasePipe } from '@app/common';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateTeacherRequest } from './dto/create-teacher.request';
import { CreateUserRequest } from './dto/create-user.request';
import { UsersService } from './users.service';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  async createUser(@Body() request: { regdNo: string; password: string }) {
    await this.usersService.validateCreateUserRequest(request);
    const rawUser: any = await this.usersService.fetchDetailsFromIterServer(
      request.regdNo,
      request.password,
    );

    if (!rawUser.message) {
      const userObj: CreateUserRequest =
        await this.usersService.createUserObject(rawUser, request.password);
      return this.usersService.createUser(userObj);
    } else {
      throw new UnauthorizedException(rawUser.message);
    }
  }

  @Post('teachers')
  async createTeacher(@Body() request: CreateTeacherRequest) {
    const regdNo: string = await this.usersService.createTeacher(request);
    return {
      statusCode: 201,
      message: `Registered successfully. Enter the OTP received in email to login.`,
      regdNo,
      error: null,
    };
  }

  @Post('teachers/verify')
  async verifyTeacher(@Body() request: { regdNo: string; otp: number }) {
    return this.usersService.validateAuthOtp(request);
  }

  @Get('request-regd-no/:email')
  async requestRegdNo(@Param('email', LowercasePipe) email: string) {
    return this.usersService.getRegdNo(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:regdNo')
  async getUserByRegdNo(@Param('regdNo', UppercasePipe) regdNo: string) {
    let type = 'student';
    if (regdNo?.slice(0, 3) === 'TCH') type = 'teacher';
    return this.usersService.getUser({ regdNo }, type);
  }
}
