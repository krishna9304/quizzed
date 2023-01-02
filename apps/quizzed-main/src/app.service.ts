import { APIResponse } from '@app/common/types';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from './constants/services';

@Injectable()
export class AppService {
  constructor(@Inject(AUTH_SERVICE) private authClient: ClientProxy) {}
  getServerStat(): APIResponse {
    return {
      code: 200,
      message: 'Server Running!',
      data: null,
      errors: [],
    };
  }
}
