import { JwtAuthGuard } from '@app/common';
import { APIResponse } from '@app/common/types';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateQuizRequest } from './dto/create-quiz.request';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  serverStats(): APIResponse {
    return this.quizService.getServerStat();
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createNewQuiz(@Req() req: Request, @Body() request: CreateQuizRequest) {
    const user: any = req.user;
    if (user.type !== 'teacher')
      throw new BadRequestException('Only teachers can create quizzes');
    return this.quizService.createQuiz(request, user);
  }
}
