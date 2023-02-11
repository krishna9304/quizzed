import { Teacher, User, JwtAuthGuard as JWTVerifyGuard } from '@app/common';
import { APIResponse } from '@app/common/types';
import { Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import JwtAuthGuard from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  serverStats(): APIResponse {
    return this.authService.getServerStat();
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: User | Teacher,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
    response.send(user);
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    await this.authService.logout(response);
    response.send(null);
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('validate_user')
  async validateUser(@CurrentUser() user: User | Teacher) {
    return user;
  }

  @UseGuards(JWTVerifyGuard)
  @Get('self')
  async getSelf(@CurrentUser() user: User | Teacher) {
    return user;
  }
}
