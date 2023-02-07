import { JwtAuthGuard } from '@app/common';
import { APIResponse } from '@app/common/types';
import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';

@Controller('quiz')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  serverStats(): APIResponse {
    return this.appService.getServerStat();
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createNewQuiz(@Req() req: Request) {
    return req.user;
  }
}
