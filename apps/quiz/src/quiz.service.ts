import {
  AzureBlobUtil,
  Question,
  QuestionRepository,
  Quiz,
  QuizRepository,
  QuizStatsRepository,
  quiz_status,
  Teacher,
  User,
} from '@app/common';
import { LIVE_SERVICE } from '@app/common/auth/services';
import { APIResponse } from '@app/common/types';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { lastValueFrom } from 'rxjs';
import { CreateQuestionRequest } from './dto/create-question.request';
import { CreateQuizRequest } from './dto/create-quiz.request';
import * as cron from 'node-cron';

import { readFileSync } from 'fs';
import * as path from 'path';
import { UpdateProgressRequest } from './dto/submit-answer.request';
import { isSubset } from './utils';

@Injectable()
export class QuizService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly quizStatsRepository: QuizStatsRepository,
    private readonly azureBlobUtil: AzureBlobUtil,
    @Inject(LIVE_SERVICE) private liveClient: ClientProxy,
  ) {
    cron.schedule('* * * * *', async () => {
      this.logger.log('Checking for live quizzes');
      try {
        const quizzes: Quiz[] = await this.quizRepository.findAllLiveQuizzes();
        quizzes.forEach(async (quiz) => {
          const now = Date.now();
          const quizEndTime =
            new Date(quiz.startTime).getTime() + quiz.duration * 60 * 1000;

          if (now >= quizEndTime) {
            await this.updateQuizStatus(quiz.quiz_id);
          }
        });
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    });
  }

  protected readonly logger = new Logger(QuizService.name);

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

  async isValidQuestionId(question_id: string) {
    const questionFound = await this.questionRepository.exists({
      question_id,
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
    question_id: string,
  ): Promise<APIResponse> {
    const quiz = await this.quizRepository.findOne({ quiz_id });
    if (quiz.questions.includes(question_id)) {
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
          $addToSet: { questions: question_id },
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

  async getQuizByQuizId(user: any, quiz_id: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({ quiz_id });
    if (user.type === 'teacher' && quiz.conducted_by !== user.regdNo)
      throw new BadRequestException('Illegal Action.');

    if (user.type === 'student') {
      if (user.section.toLowerCase() !== quiz.section.toLowerCase())
        throw new BadRequestException(
          'User do not have access to view this quiz.',
        );
      if (quiz.status === quiz_status.DRAFT)
        throw new BadRequestException(
          'Students do not have permission to view draft quizzes.',
        );
    }

    return quiz;
  }

  async getQuestionByQuestionId(question_id: string): Promise<Question> {
    return this.questionRepository.findOne({ question_id });
  }

  async changeQuizStateToLive(
    quiz_id: string,
    user: User,
  ): Promise<APIResponse> {
    const quiz = await this.quizRepository.findOne({ quiz_id });
    if (quiz.conducted_by !== user.regdNo)
      throw new BadRequestException('Illegal action.');
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

  async joinQuizByQuizId(quiz_id: string, user: User): Promise<APIResponse> {
    const quiz: Quiz = await this.quizRepository.findOne({ quiz_id });
    if (quiz.status === quiz_status.COMPLETED)
      throw new BadRequestException('Quiz is expired!');

    if (quiz.status !== quiz_status.LIVE)
      throw new BadRequestException('Quiz is not live yet!');

    if (user.section.toLowerCase() !== quiz.section.toLowerCase())
      throw new BadRequestException(
        'User do not have access to join this quiz.',
      );

    const quizStats = await this.quizStatsRepository.exists({
      $and: [{ student_regdNo: user.regdNo }, { quiz_id: quiz_id }],
    });

    const questions = await this.getAllQuestionsForAQuiz(user, quiz_id);

    if (quizStats) {
      const quizStats = await this.quizStatsRepository.findOne({
        $and: [{ student_regdNo: user.regdNo }, { quiz_id: quiz_id }],
      });
      return {
        statusCode: 200,
        message:
          'You have already joined the quiz. Please resume where you left from.',
        errors: [],
        data: { questions, quizStats },
      };
    }
    try {
      await lastValueFrom(
        this.liveClient.emit('join_quiz', {
          quiz_id,
          student_regdNo: user.regdNo,
        }),
      );
      return {
        statusCode: 200,
        message: 'Your quiz has been started.',
        data: questions,
        errors: [],
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async giveRemainingTime(quiz_id: string) {
    const quizDetail = await this.quizRepository.findOne({ quiz_id });
    const startTime = quizDetail.startTime;
    const duration = quizDetail.duration;
    const startTimeObj = new Date(startTime);
    const currentTimeObj = new Date();
    const timeSpend = currentTimeObj.getTime() - startTimeObj.getTime();
    let remainingMin = 0,
      remainingSec = 0;
    if (timeSpend < duration * 60 * 1000) {
      const remainingTime = duration * 60 * 1000 - timeSpend;
      remainingMin = remainingTime / 1000 / 60;
      remainingSec = Math.floor((remainingMin % 1) * 60);
      remainingMin = Math.floor(remainingMin);
    }
    return {
      startTime: startTime,
      remainingMinutes: remainingMin,
      remainingSeconds: remainingSec,
    };
  }

  async updateQuizStatus(quiz_id: string) {
    const updatedQuiz = await this.quizRepository.findOneAndUpdate(
      { quiz_id },
      { status: quiz_status.COMPLETED },
    );
    const quizStats = await this.quizStatsRepository.find({
      quiz_id: updatedQuiz.quiz_id,
    });
    await this.quizStatsRepository.bulkUpdateQuizStats(quizStats);
  }

  async getAllQuizzesForTeacher(
    user: Teacher,
    status: string,
    page = 1,
    limit = 10,
  ) {
    return this.quizRepository.getPaginatedQuizzesForTeacher(
      user,
      status,
      page,
      limit,
    );
  }

  async getAllPastQuizzesForStudent(user: User, page = 1, limit = 10) {
    return this.quizStatsRepository.getPaginatedPastQuizzesForStudent(
      user,
      page,
      limit,
    );
  }

  async changeQuizStateToCompleted(
    user: Teacher,
    quiz_id: string,
  ): Promise<APIResponse> {
    const quiz = await this.quizRepository.findOne({ quiz_id });
    if (quiz.conducted_by !== user.regdNo)
      throw new BadRequestException('Illegal action.');

    if (quiz.status === quiz_status.COMPLETED)
      throw new BadRequestException('Quiz is expired!');

    if (quiz.status !== quiz_status.LIVE)
      throw new BadRequestException('Quiz is not live yet!');

    await this.updateQuizStatus(quiz_id);

    return {
      statusCode: 200,
      data: null,
      errors: [],
      message: 'Quiz ended by the teacher.',
    };
  }

  async deleteDraftQuiz(user: Teacher, quiz_id: string): Promise<APIResponse> {
    const quiz = await this.quizRepository.findOne({ quiz_id });
    if (quiz.conducted_by !== user.regdNo)
      throw new BadRequestException('Illegal action.');

    if (quiz.status !== quiz_status.DRAFT)
      throw new BadRequestException('Quiz is not in draft mode!');

    await this.quizRepository.findByQuizIdAndDelete(quiz_id);

    return {
      statusCode: 200,
      data: null,
      errors: [],
      message: 'Draft deleted succesfully.',
    };
  }

  async getAllQuestionsForAQuiz(user: any, quiz_id: string) {
    const quiz = await this.quizRepository.findOne({ quiz_id });
    if (user.type === 'student' && quiz.status !== quiz_status.LIVE)
      throw new BadRequestException(
        'Students can only check the questions of a live quiz.',
      );
    const questionIds = quiz.questions;
    return this.questionRepository.findAllQuestionsByQsnIds(user, questionIds);
  }

  async getSubjects(course: string, branch: string, sem: number) {
    const SUBJECTS_PATH = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'apps',
      'quiz',
      'src',
      'constants',
      'course.json',
    );
    const configData = readFileSync(SUBJECTS_PATH, 'utf8');
    const data = JSON.parse(configData);
    return data[course][branch]['sem' + sem];
  }

  async queueUpdateProgress(
    user: any,
    request: UpdateProgressRequest,
    quiz_id: string,
  ): Promise<APIResponse> {
    const quiz: Quiz = await this.quizRepository.findOne({ quiz_id });
    if (quiz.status === quiz_status.COMPLETED)
      throw new BadRequestException('Quiz is expired!');

    if (quiz.status !== quiz_status.LIVE)
      throw new BadRequestException('Quiz is not live yet!');

    if (user.section.toLowerCase() !== quiz.section.toLowerCase())
      throw new BadRequestException(
        'You do not have access to submit answers for this quiz.',
      );

    const quizStats = await this.quizStatsRepository.exists({
      $and: [{ student_regdNo: user.regdNo }, { quiz_id: quiz_id }],
    });

    if (!quizStats) {
      return {
        statusCode: 200,
        message: `You haven't joined the quiz yet. Submitting questions without joining the quiz is an illegal action.`,
        errors: [],
        data: null,
      };
    }

    const question_ids: string[] = Object.keys(
      request.questions_attempted_details,
    );

    if (!isSubset(question_ids, quiz.questions))
      throw new BadRequestException('Illegal action.');

    const option_vals = Object.values(request.questions_attempted_details);

    if (!option_vals.every((val) => val >= 0 && val <= 3))
      throw new BadRequestException('Option values must be one of 0, 1, 2, 3.');

    await lastValueFrom(
      this.liveClient.emit('update_progress', {
        quiz_id,
        student_regdNo: user.regdNo,
        questions_attempted_details: request.questions_attempted_details,
      }),
    );

    return {
      statusCode: 200,
      message: 'Progress updated successfully.',
      errors: [],
      data: null,
    };
  }
}
