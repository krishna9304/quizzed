import { AUTH_SERVICE } from '@app/common/auth/services';
import { APIResponse } from '@app/common/types';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(@Inject(AUTH_SERVICE) private authClient: ClientProxy) {}

  getServerStat(): APIResponse {
    return {
      statusCode: 200,
      message: 'Quiz Server Running!',
      data: null,
      errors: [],
    };
  }
}
