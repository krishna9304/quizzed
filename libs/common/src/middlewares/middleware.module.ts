import { Module } from '@nestjs/common';
import { MiddlewareConsumer, NestModule } from '@nestjs/common/interfaces';
import { HttpExceptionFilter } from './http.exceptionfilter';

@Module({
  providers: [HttpExceptionFilter],
})
export class MiddlewareModule implements NestModule {
  configure(_consumer: MiddlewareConsumer) {}
}
