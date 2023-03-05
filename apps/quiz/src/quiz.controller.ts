import { JwtAuthGuard, UppercasePipe } from '@app/common';
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Types } from 'mongoose';
import { CreateQuestionRequest } from './dto/create-question.request';
import { CreateQuizRequest } from './dto/create-quiz.request';
import { QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  serverStats(): APIResponse {
    return this.quizService.getServerStat();
  }

  @Get(':quiz_id')
  @UseGuards(JwtAuthGuard)
  async getQuizDetails(@Param('quiz_id', UppercasePipe) quiz_id: string) {
    return this.quizService.getQuizByQuizId(quiz_id);
  }

  @Get('questions/:question_id')
  @UseGuards(JwtAuthGuard)
  async getQuestionDetails(
    @Param('question_id', UppercasePipe) question_id: string,
  ) {
    return this.quizService.getQuestionByQuestionId(question_id);
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
  @UseInterceptors(FileInterceptor('file'))
  async createNewQuestion(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Body() request: CreateQuestionRequest,
  ) {
    const user: any = req.user;
    if (user.type !== 'teacher')
      throw new BadRequestException('Only teachers can create questions');

    return this.quizService.createQuestion(request, file, user);
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

  @Put('publish')
  @UseGuards(JwtAuthGuard)
  async publishQuiz(
    @Req() req: Request,
    @Body('quiz_id', UppercasePipe) quiz_id: string,
  ) {
    const valid = await this.quizService.isValidQuizId(quiz_id);
    if (!valid)
      throw new BadRequestException('Please provide a valid quiz id.');

    const user: any = req.user;
    if (user.type !== 'teacher')
      throw new BadRequestException('Only teachers can publish quizzes');

    return this.quizService.changeQuizStateToLive(quiz_id);
  }

  @Get('join/:quiz_id')
  @UseGuards(JwtAuthGuard)
  async joinQuiz(
    @Req() req: Request,
    @Param('quiz_id', UppercasePipe) quiz_id: string,
  ) {
    const valid = await this.quizService.isValidQuizId(quiz_id);
    if (!valid)
      throw new BadRequestException('Please provide a valid quiz id.');

    const user: any = req.user;
    if (user.type !== 'student')
      throw new BadRequestException('Only students can join quizzes.');

    return this.quizService.joinQuizByQuizId(quiz_id, user.regdNo);
  }
}
