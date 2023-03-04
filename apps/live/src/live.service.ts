import { APIResponse } from '@app/common/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LiveService {
  getServerStat(): APIResponse {
    return {
      statusCode: 200,
      message: 'Live Server Running!',
      data: null,
      errors: [],
    };
  }
}
