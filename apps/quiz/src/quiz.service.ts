import {
  AzureBlobUtil,
  Question,
  QuestionRepository,
  Quiz,
  QuizRepository,
  QuizStatsRepository,
  quiz_status,
  Teacher,
} from '@app/common';
import { LIVE_SERVICE } from '@app/common/auth/services';
import { APIResponse } from '@app/common/types';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { isValidObjectId, Types } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { CreateQuestionRequest } from './dto/create-question.request';
import { CreateQuizRequest } from './dto/create-quiz.request';

@Injectable()
export class QuizService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly quizStatsRepository: QuizStatsRepository,
    private readonly azureBlobUtil: AzureBlobUtil,
    @Inject(LIVE_SERVICE) private liveClient: ClientProxy,
  ) {}

  getServerStat(): APIResponse {
    return {
      statusCode: 200,
      message: 'Quiz Server Running!',
      data: null,
      errors: [],
    };
  }

  async createQuiz(request: Partial<CreateQuizRequest>, user: Teacher) {
    const quiz_obj = await this.createQuizObj(request, user);
    return await this.quizRepository.create(quiz_obj);
  }

  async createQuizObj(
    request: Partial<CreateQuizRequest>,
    user: Teacher,
  ): Promise<CreateQuizRequest> {
    const last_quiz_id = await this.quizRepository.getLastQuizId();
    const quiz_obj: CreateQuizRequest = {
      quiz_id: 'SOAQZ' + new Date().getFullYear() + '_' + (last_quiz_id + 1),
      title: request.title,
      description: request.description,
      subject: request.subject,
      section: request.section,
      semester: request.semester,
      total_questions: request.total_questions,
      per_question_marks: request.per_question_marks,
      duration: request.duration,
      conducted_by: user.regdNo,
      branch: request.section.split('-')[0],
      total_marks: request.total_questions * request.per_question_marks,
      appeared_student_details: [],
      questions: [],
      status: quiz_status.DRAFT,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: null,
      startTime: null,
    };
    return quiz_obj;
  }

  async isValidQuizId(quiz_id: string) {
    const regex = new RegExp(/^soaqz\d{4}_\d+$/i);
    if (!regex.test(quiz_id)) return false;

    const quizFound = await this.quizRepository.exists({ quiz_id });
    if (!quizFound) return false;

    return true;
  }

  async isValidQuestionId(question_db_id: string) {
    if (!isValidObjectId(question_db_id)) return false;

    const questionFound = await this.questionRepository.exists({
      _id: new Types.ObjectId(question_db_id),
    });
    if (!questionFound) return false;

    return true;
  }

  async createQuestion(
    request: CreateQuestionRequest,
    file: Express.Multer.File,
    user: Teacher,
  ) {
    if (request.options.length <= request.correct_option)
      throw new BadRequestException('Invalid combination of parameters.');

    const session = await this.questionRepository.startTransaction();
    try {
      if (file) {
        const url = await this.azureBlobUtil.uploadImage(file);
        request.question_img = url;
      }
      const quiz = await this.questionRepository.create({
        ...request,
        question_id:
          'QUES' + request.subject + randomUUID().split('-')[0].toUpperCase(),
        created_by: user.regdNo,
      });
      await session.commitTransaction();
      return quiz;
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(error.message);
    }
  }

  async mapQuestionToQuiz(
    quiz_id: string,
    question_db_id: Types.ObjectId,
  ): Promise<APIResponse> {
    const quiz = await this.quizRepository.findOne({ quiz_id });
    if (quiz.questions.includes(question_db_id)) {
      throw new BadRequestException(
        'This question is already mapped to the quiz.',
      );
    }
    if (quiz.status !== quiz_status.DRAFT) {
      throw new BadRequestException('Quiz is not in draft mode!');
    }
    if (quiz.questions.length < quiz.total_questions) {
      const updatedQuiz = await this.quizRepository.findOneAndUpdate(
        { quiz_id },
        {
          $addToSet: { questions: question_db_id },
          updated_at: new Date().toISOString(),
        },
      );
      return {
        statusCode: 200,
        message: 'Question added to quiz with Quiz ID: ' + quiz_id,
        data: updatedQuiz,
        errors: [],
      };
    } else {
      throw new BadRequestException('Maximum questions reached!');
    }
  }

  async getQuizByQuizId(quiz_id: string): Promise<Quiz> {
    return this.quizRepository.findOne({ quiz_id });
  }

  async getQuestionByQuestionId(question_id: string): Promise<Question> {
    return this.questionRepository.findOne({ question_id });
  }

  async changeQuizStateToLive(quiz_id: string): Promise<APIResponse> {
    const quiz = await this.quizRepository.findOne({ quiz_id });
    if (quiz.questions.length !== quiz.total_questions) {
      const questionsLeft = quiz.total_questions - quiz.questions.length;
      throw new BadRequestException(
        `You need to add ${questionsLeft} more questions to the quiz in order to publish it.`,
      );
    }
    if (quiz.status === quiz_status.DRAFT) {
      const updatedQuiz = await this.quizRepository.findOneAndUpdate(
        { quiz_id },
        {
          status: quiz_status.LIVE,
          startTime: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      );
      return {
        statusCode: 200,
        data: updatedQuiz,
        errors: [],
        message: `Yay! Your quiz with quiz id "${quiz_id}" is now live.`,
      };
    } else if (quiz.status === quiz_status.LIVE) {
      throw new BadRequestException('This quiz is already live.');
    } else {
      throw new BadRequestException(
        "This quiz's status is completed, you cannot re-publish it.",
      );
    }
  }

  async joinQuizByQuizId(
    quiz_id: string,
    student_regdNo: string,
  ): Promise<APIResponse> {
    const quiz = await this.quizRepository.findOne({ quiz_id });
    if (quiz.status === quiz_status.COMPLETED)
      throw new BadRequestException('Quiz is expired!');

    if (quiz.status !== quiz_status.LIVE)
      throw new BadRequestException('Quiz is not live yet!');

    const alreadyJoined = await this.quizStatsRepository.exists({
      $and: [{ student_regdNo: student_regdNo }, { quiz_id: quiz_id }],
    });
    if (alreadyJoined)
      throw new BadRequestException(
        `You have already joined the quiz ${quiz_id}`,
      );
    try {
      await lastValueFrom(
        this.liveClient.emit('join_quiz', {
          quiz_id,
          student_regdNo,
        }),
      );
      return {
        statusCode: 200,
        message: 'Your quiz has been started.',
        data: null,
        errors: [],
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
