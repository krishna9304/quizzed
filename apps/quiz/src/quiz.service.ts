import { AzureBlobUtil, Teacher } from '@app/common';
import { APIResponse } from '@app/common/types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { isValidObjectId, Types } from 'mongoose';
import { CreateQuestionRequest } from './dto/create-question.request';
import { CreateQuizRequest } from './dto/create-quiz.request';
import { QuestionRepository } from './repositories/question.repository';
import { QuizRepository } from './repositories/quiz.repository';
import { quiz_status } from './schemas/quiz.schema';

@Injectable()
export class QuizService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly azureBlobUtil: AzureBlobUtil,
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
      total_students_appeared: {},
      questions: [],
      status: quiz_status.DRAFT,
      created_at: new Date().toDateString(),
      updated_at: new Date().toDateString(),
      metadata: null,
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
    if (quiz.status !== quiz_status.DRAFT) {
      throw new BadRequestException('Quiz is not in draft mode!');
    }
    if (quiz.questions.length < quiz.total_questions) {
      await this.quizRepository.findOneAndUpdate(
        { quiz_id },
        { $addToSet: { questions: question_db_id } },
      );
      return {
        statusCode: 200,
        message: 'Question added to quiz with Quiz ID: ' + quiz_id,
        data: null,
        errors: [],
      };
    } else {
      throw new BadRequestException('Maximum questions reached!');
    }
  }
}
