import {
  ExceptionFilter,
  Catch,
  HttpException,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.getStatus() === 408) {
      response.status(408).send({
        statusCode: 408,
        message: 'Request timeout',
      });
    } else {
      response.status(exception.getStatus()).send({
        statusCode: exception.getStatus(),
        message: exception.message,
      });
    }
  }
}
