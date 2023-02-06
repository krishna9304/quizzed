import {
  Body,
  Controller,
  HttpException,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import { UsersService } from './users.service';

@Controller('auth/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() request: { regdNo: string; password: string }) {
    try {
      const rawUser: any = await this.usersService.fetchDetailsFromIterServer(
        request.regdNo,
        request.password,
      );

      console.log(rawUser);
      if (!rawUser.message) {
        const userObj: CreateUserRequest =
          await this.usersService.createUserObject(rawUser, request.password);
        return this.usersService.createUser(userObj);
      } else {
        return new UnauthorizedException(
          'Credentials are not valid.',
        ).getResponse();
      }
    } catch (error) {
      throw new HttpException('Failed to process the request.', 500, {
        cause: new Error(error),
      });
    }
  }
}
