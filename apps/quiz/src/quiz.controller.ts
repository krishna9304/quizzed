import { JwtAuthGuard, UppercasePipe } from '@app/common';
import { APIResponse } from '@app/common/types';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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

  @Get('getall')
  @UseGuards(JwtAuthGuard)
  async getAllQuizzes(@Req() req: Request, @Query() query: any) {
    const status: string = query?.status?.toLowerCase() || '';
    const page: number = parseInt(query?.page);
    const limit: number = parseInt(query?.limit);
    const user: any = req.user;
    if (user.type === 'teacher')
      return this.quizService.getAllQuizzesForTeacher(
        user,
        status,
        page,
        limit,
      );
    if (user.type === 'student')
      return this.quizService.getAllPastQuizzesForStudent(user, page, limit);
  }

  @Get(':quiz_id')
  @UseGuards(JwtAuthGuard)
  async getQuizDetails(@Param('quiz_id', UppercasePipe) quiz_id: string) {
    const valid = await this.quizService.isValidQuizId(quiz_id);
    if (!valid)
      throw new BadRequestException('Please provide a valid quiz id.');
    return this.quizService.getQuizByQuizId(quiz_id);
  }

  @Get('questions/:question_id')
  @UseGuards(JwtAuthGuard)
  async getQuestionDetails(
    @Param('question_id', UppercasePipe) question_id: string,
  ) {
    return this.quizService.getQuestionByQuestionId(question_id);
  }

  @Get(':quiz_id/get-all-questions')
  @UseGuards(JwtAuthGuard)
  async getQuestions(@Req() req: Request, @Param('quiz_id') quiz_id: string) {
    const valid = await this.quizService.isValidQuizId(quiz_id);
    if (!valid)
      throw new BadRequestException('Please provide a valid quiz id.');
    const user: any = req.user;
    return this.quizService.getAllQuestionForAQuiz(user, quiz_id);
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

    return this.quizService.changeQuizStateToLive(quiz_id, user);
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

  @Get('get_remaining_time/:quiz_id')
  @UseGuards(JwtAuthGuard)
  async remainingTime(@Param('quiz_id', UppercasePipe) quiz_id: string) {
    const valid = await this.quizService.isValidQuizId(quiz_id);
    if (!valid)
      throw new BadRequestException('Please provide a valid quiz id.');
    return this.quizService.giveRemainingTime(quiz_id);
  }

  @Put('end-quiz/:quiz_id')
  @UseGuards(JwtAuthGuard)
  async endQuiz(
    @Req() req: Request,
    @Param('quiz_id', UppercasePipe) quiz_id: string,
  ) {
    const valid = await this.quizService.isValidQuizId(quiz_id);
    if (!valid)
      throw new BadRequestException('Please provide a valid quiz id.');

    const user: any = req.user;
    if (user.type !== 'teacher')
      throw new BadRequestException('Only teachers can end quizzes');

    return this.quizService.changeQuizStateToCompleted(user, quiz_id);
  }

  @Delete(':quiz_id')
  @UseGuards(JwtAuthGuard)
  async deleteDraft(
    @Req() req: Request,
    @Param('quiz_id', UppercasePipe) quiz_id: string,
  ) {
    const valid = await this.quizService.isValidQuizId(quiz_id);
    if (!valid)
      throw new BadRequestException('Please provide a valid quiz id.');

    const user: any = req.user;
    if (user.type !== 'teacher')
      throw new BadRequestException('Only teachers can delete draft quizzes');

    return this.quizService.deleteDraftQuiz(user, quiz_id);
  }
}
