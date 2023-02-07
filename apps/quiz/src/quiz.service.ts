import { Teacher } from '@app/common';
import { AUTH_SERVICE } from '@app/common/auth/services';
import { APIResponse } from '@app/common/types';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateQuizRequest } from './dto/create-quiz.request';

@Injectable()
export class QuizService {
  constructor(@Inject(AUTH_SERVICE) private authClient: ClientProxy) {}

  getServerStat(): APIResponse {
    return {
      statusCode: 200,
      message: 'Quiz Server Running!',
      data: null,
      errors: [],
    };
  }

  async createQuiz(request: CreateQuizRequest, user: Teacher) {
    console.log(user, request);
    return null;
  }
}
