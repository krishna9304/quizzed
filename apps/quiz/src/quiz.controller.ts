import { JwtAuthGuard } from '@app/common';
import { APIResponse } from '@app/common/types';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Types } from 'mongoose';
import { CreateQuestionRequest } from './dto/create-question.request';
import { CreateQuizRequest } from './dto/create-quiz.request';
import { UppercasePipe } from './pipes/uppercase.pipe';
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

  @Post('questions')
  @UseGuards(JwtAuthGuard)
  async createNewQuestion(
    @Req() req: Request,
    @Body() request: CreateQuestionRequest,
  ) {
    const user: any = req.user;
    if (user.type !== 'teacher')
      throw new BadRequestException('Only teachers can create questions');
    return this.quizService.createQuestion(request, user);
  }

  @Put('add-question/:quiz_id')
  @UseGuards(JwtAuthGuard)
  async addQuestionToQuiz(
    @Param('quiz_id', UppercasePipe) quiz_id: string,
    @Req() req: Request,
    @Body() { question_db_id }: { question_db_id: string },
  ) {
    let valid = await this.quizService.isValidQuizId(quiz_id);
    if (!valid)
      throw new BadRequestException('Please provide a valid quiz id.');

    valid = await this.quizService.isValidQuestionId(question_db_id);
    if (!valid)
      throw new BadRequestException('Please provide a valid question id.');

    const user: any = req.user;
    if (user.type !== 'teacher')
      throw new BadRequestException(
        'Only teachers can add questions to quizzes',
      );
    return this.quizService.mapQuestionToQuiz(
      quiz_id,
      new Types.ObjectId(question_db_id),
    );
  }
}
